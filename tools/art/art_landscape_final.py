import bpy,os,math,random,json,contextlib,io
import numpy as np
from mathutils import Vector,Matrix
from math import pi,sin,cos
def _repo_root(start):
    p=os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(p,'package.json')) and os.path.dirname(p)!=p:
        p=os.path.dirname(p)
    return p

ROOT=_repo_root(__file__);OUT=os.path.join(ROOT,'deliverables');ASSETS=os.path.join(ROOT,'reference','assets');main=bpy.context.scene;scene=main
art=bpy.data.collections['10 Art direction | Poly Haven CC0'];art_main=art;random.seed(1249)
source=open(os.path.join(ROOT,'art_pass.py'),encoding='utf-8').read()
exec(source[source.index('def bounds'):source.index('# Real, individually')])
exec(source[source.index('def scanned'):source.index('floor=scanned')])
exec(source[source.index('def assign'):source.index('for o in list(scene.objects):',source.index('def assign'))])
# Bake the original detailed artist tree into transparent far-distance impostors.
# This preserves actual foliage silhouettes without replicating millions of leaf polygons.
bak=bpy.data.scenes.new('Temporary artist-tree impostor capture');bc=bpy.data.collections.new('Temporary tree capture');bak.collection.children.link(bc)
oldscene=bpy.context.window.scene
files=[]
try:
 bpy.context.window.scene=bak;scene=bak;art=bc;templates={};obs=imported('tree_small_02');lo,hi=bounds(obs);sz=hi-lo;shift=Vector((-(lo.x+hi.x)/2,-(lo.y+hi.y)/2,-lo.z))
 for o in obs:o.matrix_world=Matrix.Translation(shift)@o.matrix_world
 bak.world=main.world.copy();bg=next(n for n in bak.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Strength'].default_value=.42
 ld=bpy.data.lights.new('Capture soft sun','SUN');ld.energy=2.0;ld.angle=.10;light=bpy.data.objects.new('Capture sun',ld);bc.objects.link(light);light.rotation_euler=(.35,-.4,-.5)
 cd=bpy.data.cameras.new('Capture tree');cam=bpy.data.objects.new('Capture tree',cd);bc.objects.link(cam);cd.type='ORTHO';cd.ortho_scale=max(sz)*1.16;bak.camera=cam
 bak.render.engine='CYCLES';bak.cycles.samples=12;bak.cycles.use_denoising=True;bak.render.resolution_x=512;bak.render.resolution_y=512;bak.render.resolution_percentage=100;bak.render.film_transparent=True;bak.render.image_settings.file_format='PNG';bak.render.image_settings.color_mode='RGBA';bak.view_settings.view_transform='Standard'
 for k in range(4):
  a=k*pi/2;cam.location=(sin(a)*8,-cos(a)*8,sz.z*.56);cam.rotation_euler=(Vector((0,0,sz.z*.50))-cam.location).to_track_quat('-Z','Y').to_euler();file=os.path.join(ASSETS,'tree_small_02','impostor_'+str(k)+'.png');bak.render.filepath=file;bpy.ops.render.render(write_still=True);files.append(file)
finally:
 bpy.context.window.scene=oldscene;scene=main;art=art_main
 for o in list(bc.objects):bpy.data.objects.remove(o,do_unlink=True)
 bpy.data.scenes.remove(bak);bpy.data.collections.remove(bc)
land=bpy.data.collections.new('11 Landscape final | scanned stones and wooded heightfield');main.collection.children.link(land)
def mesh(name,vs,fs,mat,uvs=None):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);land.objects.link(o);me.materials.append(mat)
 for p in me.polygons:p.use_smooth=True
 uv=me.uv_layers.new(name='UVMap')
 for p in me.polygons:
  for li in p.loop_indices:
   vi=me.loops[li].vertex_index;co=me.vertices[vi].co;uv.data[li].uv=uvs[vi] if uvs else (co.x/14,co.y/14)
 return o
def grade(m,target,contrast=.55):
 p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');tex=p.inputs['Base Color'].links[0].from_node;im=tex.image;w,h=im.size;a=np.empty(w*h*4,np.float32);im.pixels.foreach_get(a);a=a.reshape(h,w,4);mean=a[:,:,:3].mean((0,1));tar=np.array(target)
 a[:,:,:3]=np.clip(tar+(a[:,:,:3]/np.maximum(mean,1e-4)*tar-tar)*contrast,0,1);new=bpy.data.images.new(m.name+' | restrained scan',width=w,height=h,alpha=True);new.pixels.foreach_set(a.ravel());new.pack();tex.image=new
soil=scanned('brown_mud_dry','Art | quiet worn garden earth',.35);grade(soil,(.24,.22,.165),.55)
grass=scanned('aerial_grass_rock','Art | natural distant moss and grass',.27);grade(grass,(.20,.245,.17),.52)
gravel=scanned('gravel_ground_01','Art | small loose path gravel',.35);grade(gravel,(.32,.30,.25),.65)
# Retire the continuous annular ridge bands and the leaf-carpet plane.
for o in list(main.objects):
 if o.name.startswith('Landscape | ridge ') or o.name.startswith('Garden | surrounding earth') or o.name=='Garden | gravel path' or (o.name=='Garden | unified detail.001' and o.type=='MESH' and any('Glazed stoneware' in m.name for m in o.data.materials)):
  bpy.data.objects.remove(o,do_unlink=True)
def height(x,y):
 d=math.hypot(x,y);t=max(0,min(1,(d-16)/85));w=t*t*(3-2*t)
 n=sin(x*.043+y*.037)+.7*sin(x*.075-y*.060+.8)+.38*sin(x*.15+y*.12+2.3)+.15*sin(x*.31-y*.17)
 return -.23+w*max(.25,6+n*3.35)
vs=[];fs=[];N=144;extent=125
for j in range(N+1):
 y=-extent+j*(extent*2/N)
 for i in range(N+1):x=-extent+i*(extent*2/N);vs.append((x,y,height(x,y)))
for j in range(N):
 for i in range(N):a=j*(N+1)+i;fs.append((a,a+1,a+N+2,a+N+1))
terrain=mesh('Art | continuous rolling wooded terrain',vs,fs,grass)
terrain['noShadow']=True
# The playable near yard stays flat; its scan is fine earth, not a repeating leaf sea.
yard=mesh('Art | near garden worn soil',[(-13,-13,-.205),(13,-13,-.205),(13,18,-.205),(-13,18,-.205)],[(0,1,2,3)],soil,[(0,0),(7,0),(7,8.35),(0,8.35)])
# A soft-edged winding gravel bed joins the porch to an irregular scanned-stone path.
vs=[];fs=[]
for j in range(19):
 y=7.95+j*.48;x=.15*sin((y-8)*.55);w=.58+.06*sin(j*1.7)
 vs.extend([(x-w,y,-.185),(x+w,y,-.185)])
for j in range(18):a=j*2;fs.append((a,a+1,a+3,a+2))
path=mesh('Art | worn winding gravel footpath',vs,fs,gravel)
# Real six-piece moss rock set, reduced once, gives the steps different eroded outlines.
templates={};rocks=imported('rock_moss_set_01')
for o in rocks:
 bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Scanned stepping stone LOD','DECIMATE');mod.ratio=.38;bpy.ops.object.modifier_apply(modifier=mod.name)
 # Bake imported transforms so later nonuniform flattening cannot introduce shear.
 o.data=o.data.copy();o.data.transform(o.matrix_world);o.matrix_world=Matrix.Identity(4)
for i in range(13):
 src=rocks[i%len(rocks)];o=src.copy();o.data=src.data.copy();land.objects.link(o)
 lo,hi=bounds([o]);size=hi-lo;pivot=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z));y=8.24+i*.59;x=.15*sin((y-8)*.55)+random.uniform(-.11,.11)
 dims=(random.uniform(.68,.90),random.uniform(.42,.53),random.uniform(.075,.10))
 T=Matrix.Translation((x,y,-.185))@Matrix.Rotation(random.uniform(-.27,.27),4,'Z')@Matrix.Diagonal((*(dims[k]/size[k] for k in range(3)),1))@Matrix.Translation(-pivot);o.data.transform(T);o.name='Art | individual worn stepping stone '+str(i)
for o in rocks:bpy.data.objects.remove(o,do_unlink=True)
# Far forest layers use the captured artist foliage at three irregular depths.
imats=[]
for k,file in enumerate(files):
 m=bpy.data.materials.new('Art | captured distant tree '+str(k));m.use_nodes=True;nd=m.node_tree.nodes;lk=m.node_tree.links;p=next(n for n in nd if n.type=='BSDF_PRINCIPLED');im=bpy.data.images.load(file,check_existing=True);im.pack();tex=nd.new('ShaderNodeTexImage');tex.image=im;lk.new(tex.outputs['Color'],p.inputs['Base Color']);lk.new(tex.outputs['Alpha'],p.inputs['Alpha']);p.inputs['Roughness'].default_value=.95
 try:m.surface_render_method='DITHERED'
 except:pass
 imats.append(m)
for layer,(radius,count) in enumerate([(47,44),(69,58),(94,68)]):
 for i in range(count):
  a=i/count*2*pi+random.uniform(-.018,.018);r=radius+random.uniform(-5,5);x=r*cos(a);y=r*sin(a);h=random.uniform(6.0,10.0)*(1+layer*.14);w=h*.96;z=height(x,y)-.08;right=Vector((-sin(a),cos(a),0));c=Vector((x,y,z));v=[tuple(c-right*w/2),tuple(c+right*w/2),tuple(c+right*w/2+Vector((0,0,h))),tuple(c-right*w/2+Vector((0,0,h)))]
  o=mesh('Art | distant forest capture '+str(layer)+' '+str(i),v,[(0,3,2,1)],imats[(i+layer)%4],[(0,0),(1,0),(1,1),(0,1)]);o['impostor']=True;o['noShadow']=True
# Only the art face receives the original watercolor; the wood frame and mat stay intact.
for o in list(main.objects):
 if o.name.startswith('Bedroom | empty landscape | landscape lines') or o.name.startswith('Bedroom | empty landscape | blank faded photograph'):bpy.data.objects.remove(o,do_unlink=True)
lake=bpy.data.materials.new('Art | original lake watercolor');lake.use_nodes=True;nd=lake.node_tree.nodes;lk=lake.node_tree.links;p=next(n for n in nd if n.type=='BSDF_PRINCIPLED');im=bpy.data.images.load(os.path.join(ROOT,'public','art','lake-watercolor.png'),check_existing=True);im.pack();tex=nd.new('ShaderNodeTexImage');tex.image=im;lk.new(tex.outputs['Color'],p.inputs['Base Color']);p.inputs['Roughness'].default_value=.92
o=mesh('Bedroom | empty landscape | lake watercolor',[(2.93,-5.94,1.64),(3.77,-5.94,1.64),(3.77,-5.94,2.20),(2.93,-5.94,2.20)],[(0,3,2,1)],lake,[(0,0),(1,0),(1,1),(0,1)]);o['noShadow']=True
# Remove obsolete prototype grass/leaf cards; all near vegetation is now artist-authored.
for o in list(main.objects):
 if o.name=='Garden | unified detail.004' or (o.type=='MESH' and any(m and m.name=='Garden | dusty green leaves' for m in o.data.materials)):
  bpy.data.objects.remove(o,do_unlink=True)
# Resolution budget: ground scans1k; actual stones2k; far captures512; interior heroes unchanged.
for m in [soil,grass,gravel]:
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE' and n.image and max(n.image.size)>1024:
   im=n.image;w,h=im.size;factor=1024/max(w,h);im.scale(round(w*factor),round(h*factor));im.pack()
try:bpy.data.orphans_purge(do_local_ids=True,do_linked_ids=False,do_recursive=True)
except:pass
main.render.resolution_percentage=75;main.cycles.samples=32
for name,file in [('07 Garden','art_landscape_final_review.png'),('01 Kitchen','art_window_final_review.png'),('02 Bedroom','art_bedroom_final_review.png')]:main.camera=bpy.data.objects[name];main.render.filepath=os.path.join(OUT,file);bpy.ops.render.render(write_still=True)
main.camera=bpy.data.objects['01 Kitchen'];bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_ArtPass.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in main.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
dest=os.path.join(ROOT,'public','models','DogYears_ArtPass_Final_raw.glb');buf=io.StringIO()
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=dest,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=True,export_image_format='WEBP',export_image_quality=86)
print('FINAL LANDSCAPE RAW EXPORT',os.path.getsize(dest),'bytes; run repair_glb_textures.mjs then validate_art.mjs')
