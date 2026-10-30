import bpy,os,math,random,contextlib,io
from math import pi,sin,cos
from mathutils import Vector
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
random.seed(1949)
back=bpy.data.collections.new('09 Garden depth | ridges and forest');s.collection.children.link(back)
for o in list(s.objects):
 if o.name=='Garden | distant soft hills' or (o.name=='Garden | unified detail' and o.type=='MESH' and o.data.materials[0].name=='Walnut | worn edges'):
  bpy.data.objects.remove(o,do_unlink=True)
def material(name,c,rough=1):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough;return m
earth=[material('Distance | wooded ground',(.16,.21,.155)),material('Distance | middle blue green',(.235,.29,.25)),material('Distance | far blue grey',(.32,.37,.345))]
crowns=[material('Canopy | deep olive',(.115,.165,.085),.88),material('Canopy | dusty sage',(.19,.245,.13),.88),material('Canopy | autumn ochre',(.28,.245,.12),.9),material('Canopy | distant green',(.23,.285,.23),.95),material('Canopy | distant grey',(.30,.355,.315),.95)]
bark=bpy.data.materials.get('Walnut | worn edges.002') or material('Distance | bark',(.12,.105,.08))
def mesh(name,vs,fs,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);back.objects.link(o);me.materials.append(mat)
 for p in me.polygons:p.use_smooth=True
 return o
def height(angle,band):
 return [4.6,10.4,17.8][band]+[1.4,2.7,4.1][band]*(.6*sin(angle*3+band*.8)+.27*sin(angle*7+1.4)+.13*sin(angle*13+.7))
# Three complete, overlapping annular terrain ribbons give every window a layered horizon.
for b,(r0,r1,r2) in enumerate([(16,29,44),(33,48,68),(55,72,103)]):
 vs=[];fs=[];seg=256;nr=12
 for j in range(nr+1):
  q=j/nr;r=r0+(r2-r0)*q
  w=max(0,1-abs(r-r1)/(r1-r0 if r<r1 else r2-r1))
  for i in range(seg):
   a=i/seg*2*pi;rr=r+sin(a*5+b)*.9+sin(a*11)*.35
   z=-.27+height(a,b)*(w**.7)+b*1.5
   vs.append((rr*cos(a),rr*sin(a),z))
 for j in range(nr):
  for i in range(seg):a=j*seg+i;bb=j*seg+(i+1)%seg;fs.append((a,bb,bb+seg,a+seg))
 mesh('Landscape | ridge '+str(b+1),vs,fs,earth[b])
def trunk(x,y,z,h,r):
 vs=[];fs=[];seg=9
 for j,(rr,hh) in enumerate([(r,0),(r*.75,h*.55),(r*.22,h)]):
  for i in range(seg):a=i/seg*2*pi;vs.append((x+rr*cos(a),y+rr*sin(a),z+hh))
 for j in range(2):
  for i in range(seg):a=j*seg+i;b=j*seg+(i+1)%seg;fs.append((a,b,b+seg,a+seg))
 mesh('Forest | irregular trunk',vs,fs,bark)
def broad_crown(x,y,z,rx,ry,rz,mat,seed):
 # An irregular lobed crown, with finite leaf-scale edge noise, not a sphere primitive.
 rng=random.Random(seed);seg=13;rings=8;vs=[];fs=[]
 for j in range(rings+1):
  v=j/rings*pi
  for i in range(seg):
   a=i/seg*2*pi;r=1+rng.uniform(-.10,.10)+.13*sin(a*5+j*.7)
   vs.append((x+rx*sin(v)*cos(a)*r,y+ry*sin(v)*sin(a)*r,z+rz*cos(v)*(1+rng.uniform(-.05,.05))))
 for j in range(rings):
  for i in range(seg):a=j*seg+i;b=j*seg+(i+1)%seg;fs.append((a,b,b+seg,a+seg))
 mesh('Forest | layered broadleaf crown',vs,fs,mat)
def fir(x,y,z,h,w,mat,seed):
 rng=random.Random(seed);vs=[];fs=[];seg=11;rings=13
 for j in range(rings+1):
  q=j/rings;r=w*(1-q)*(.72 if j%2 else 1)
  for i in range(seg):a=i/seg*2*pi;rr=r*(1+rng.uniform(-.12,.12));vs.append((x+rr*cos(a),y+rr*sin(a),z+h*q))
 for j in range(rings):
  for i in range(seg):a=j*seg+i;b=j*seg+(i+1)%seg;fs.append((a,b,b+seg,a+seg))
 mesh('Forest | irregular fir silhouette',vs,fs,mat)
# Tree-line follows each crest, with gaps, height variation and mixed species.
for b,(radius,count) in enumerate([(27,76),(46,104),(70,132)]):
 for i in range(count):
  a=i/count*2*pi+random.uniform(-.018,.018)
  if i%17==0:continue
  r=radius+random.uniform(-1.3,1.3);x=r*cos(a);y=r*sin(a)
  z=height(a,b)*(.91 if b==0 else .94)+b*1.5-.2
  h=random.uniform(2.7,5.4)*(1 if b==0 else 1.15)
  mat=crowns[random.randrange(3)] if b==0 else crowns[b+2]
  trunk(x,y,z,h*.76,.10 if b==0 else .13)
  if random.random()<.38:fir(x,y,z+h*.17,h*.93,random.uniform(.85,1.45),mat,1000+b*1000+i)
  else:
   for k in range(3):
    aa=k*2.4+i;off=.45*h/4
    broad_crown(x+off*cos(aa),y+off*sin(aa),z+h*(.62+k*.09),h*.29,h*.28,h*.31,mat,3000+b*1000+i*3+k)
# Mid-ground stands frame the near yard. Trees have branches and differentiated crowns.
for i,(x,y) in enumerate([(-10,-4),(-11,3),(-8,11),(-4.5,14),(4,15),(8,12),(11,5),(10,-4),(6,-12),(0,-14),(-7,-12)]):
 h=random.uniform(5.2,7.5);trunk(x,y,-.2,h*.78,.20)
 for k in range(4):
  a=k*2.4+i;off=.8
  broad_crown(x+off*cos(a),y+off*sin(a),h*.69+k*.16,1.5,1.4,1.45,crowns[(i+k)%3],6000+i*4+k)
# Distant tree and ridge meshes are joined by material: depth without hundreds of draw calls.
groups={}
for o in list(back.objects):groups.setdefault(o.data.materials[0].name,[]).append(o)
for key,obs in groups.items():
 if len(obs)<2:continue
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.select_set(True)
 bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();bpy.context.view_layer.objects.active.name='Landscape | '+key
# A readable dry-afternoon sky and fill for the reference renders only; game light is dynamic.
bg=next(n for n in s.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.49,.52,.51,1);bg.inputs[1].default_value=.46
s.render.resolution_percentage=70;s.cycles.samples=24
for cam,f in [('07 Garden','game_garden_depth.png'),('01 Kitchen','game_kitchen_depth.png')]:
 s.camera=bpy.data.objects[cam];s.render.filepath=os.path.join(OUT,f);bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['01 Kitchen']
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_Game.blend'))
buf=io.StringIO()
with contextlib.redirect_stdout(buf):
 bpy.ops.object.select_all(action='DESELECT')
 for o in back.objects:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','models','DogYears_Garden.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
 bpy.ops.object.select_all(action='DESELECT')
 for o in s.objects:
  if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','models','DogYears_Game.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
print('GARDEN DEPTH COMPLETE; all 360 degrees; full Game includes backdrop; bytes',os.path.getsize(os.path.join(ROOT,'public','models','DogYears_Game.glb')))
