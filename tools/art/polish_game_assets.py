import bpy,math,os,random,json
import numpy as np
from mathutils import Vector,Matrix
from math import sin,cos,pi
def _repo_root(start):
    p=os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(p,'package.json')) and os.path.dirname(p)!=p:
        p=os.path.dirname(p)
    return p

ROOT=_repo_root(__file__);OUT=os.path.join(ROOT,'deliverables')
scene=bpy.context.scene
collections={c.name:c for c in scene.collection.children};current=collections['03 Kitchen']
source=open(os.path.join(ROOT,'build_house.py'),encoding='utf-8').read()
exec(source[source.index('def put'):source.index('# Architectural shell')])
random.seed(148)
def center(o):return sum((o.matrix_world@Vector(c) for c in o.bound_box),Vector())/8
# Remove every legacy short chair leg, including disconnected pieces at the origin.
removed=[]
for o in list(scene.objects):
 if o.name.startswith('Chair |') or (o.name.startswith('Turned furniture leg') and .43<float(o.dimensions.z)<.49):
  removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
def newchair(name,x,y,angle):
 before=set(scene.objects);chair(0,0,0)
 pieces=list(set(scene.objects)-before)
 T=Matrix.Translation((x,y,0))@Matrix.Rotation(angle,4,'Z')
 for o in pieces:o.matrix_world=T@o.matrix_world;o.name=name+' | '+o.name
 return pieces
current=collections['03 Kitchen'];newchair('DY_Chair_Kitchen_A',-3.1,-1.7,pi+.08);newchair('DY_Chair_Kitchen_B',-3.35,-3.4,-.16)
current=collections['05 Study'];newchair('DY_Chair_Study',-3.55,3.75,pi+.10)
# Reconstruct bedding with broad weight-bearing folds, not sinusoidal corrugations.
for o in list(scene.objects):
 if o.name.startswith(('Duvet |','Throw |')):bpy.data.objects.remove(o,do_unlink=True)
current=collections['04 Bedroom']
def bedding(name,cx,cy,w,d,z,drape,material,fold=False):
 nx=60;ny=48;vs=[];fs=[]
 for j in range(ny+1):
  v=j/ny;yy=cy+(v-.5)*d
  for i in range(nx+1):
   u=i/nx;xx=cx+(u-.5)*w
   edge=max(0,(abs(xx-cx)-.87)/(.5*w-.87))
   zz=z-drape*(edge**.72)
   # Two modest diagonal creases with localized falloff.
   zz+=.014*math.exp(-((xx-cx+.15+.22*(yy-cy))/.12)**2)*math.exp(-((yy-cy-.24)/.65)**2)
   zz-=.010*math.exp(-((xx-cx-.31-.15*(yy-cy))/.15)**2)*math.exp(-((yy-cy+.19)/.58)**2)
   zz+=.003*sin(xx*8+yy*9)*sin(yy*5)*sin(pi*u)
   if fold:zz+=.025*math.exp(-((v-.18)/.15)**2)
   vs.append((xx,yy,zz))
 for j in range(ny):
  for i in range(nx):a=j*(nx+1)+i;fs.append((a,a+1,a+nx+2,a+nx+1))
 o=mesh(name,vs,fs,material);m=o.modifiers.new('Cotton hem thickness','SOLIDIFY');m.thickness=.006
 return o
bedding('Duvet | weighted cotton',3.35,-3.35,2.12,1.82,.751,.25,white)
bedding('Throw | folded blue wool',3.35,-2.86,2.16,.69,.775,.25,blue,True)
for i in range(29):
 x=2.36+i*.071
 tube('Throw | soft fringe',[(x,-2.51,.777),(x+.006,-2.47,.773),(x+.004,-2.445,.768)],.0015,blue)
# Typography and decorative objects give surfaces history without explanatory placards.
def photo(name,x,y,z,w,h,portrait=False):
 box(name+' | frame',(x,y,z),(w,.045,h),walnut,.01)
 box(name+' | mount',(x,y-.027,z),(w-.042,.005,h-.042),paper,.001)
 bg=mat(name+' faded emulsion',(.25,.25,.21),.9)
 box(name+' | faded print',(x,y-.031,z),(w-.09,.003,h-.09),bg,.001)
 # Abstract silhouettes and horizon rather than copied photographs.
 if portrait:
  orb(name+' | remembered silhouette',(x,y-.035,z+.04),(w*.12,.002,h*.13),walnut)
  box(name+' | shoulders',(x,y-.035,z-h*.16),(w*.36,.003,h*.22),walnut,.025)
 else:
  tube(name+' | far hills',[(x-w*.35,y-.036,z-.02),(x-w*.12,y-.036,z+.04),(x+w*.08,y-.036,z+.01),(x+w*.34,y-.036,z-.02)],.012,linen)
current=collections['02 Entry']
# Frames on the hallway are placed on side walls and rotated as complete groups.
for k,(y,z,w,h) in enumerate([(-2.4,1.8,.32,.42),(-1.85,1.95,.40,.29),(-1.36,1.72,.27,.34)]):
 before=set(scene.objects);photo('Hall | family photograph '+str(k),0,0,0,w,h,k==0)
 for o in set(scene.objects)-before:o.matrix_world=Matrix.Translation((-.88,y,z))@Matrix.Rotation(-pi/2,4,'Z')@o.matrix_world
# A real bench at the entrance, tucked to one side and never blocking the passage.
current=collections['04 Bedroom']
for i in range(4):book(1.78,-4.19,.65+i*.032,.15,.20,.025,leather)
current=collections['03 Kitchen']
for k,(x,z) in enumerate([(-4.32,1.65),(-3.9,1.65),(-2.9,2.2)]):
 for j in range(3):lathe('Kitchen | stacked side plates',x,-5.79,z+j*.015,[(0,0),(.10,0),(.125,.012),(.12,.018),(0,.006)],ceramic,48)
for i in range(3):
 x=-4.7+i*.22
 lathe('Kitchen | tea tin',x,-5.79,2.24,[(0,0),(.072,0),(.072,.18),(.078,.18),(.078,.19),(0,.19)],green,48)
 text('Kitchen | tea tin label',['EARL GREY','DARJEELING','ASSAM'][i],(x-.05,-5.712,2.33),.014,paper,(pi/2,0,pi))
# A hanging rail with individually modelled utensils.
tube('Kitchen | utensil rail',[(-2.9,-5.94,1.48),(-1.55,-5.94,1.48)],.01,brass)
for i in range(4):
 x=-2.75+i*.24
 tube('Kitchen | utensil hook',[(x,-5.94,1.5),(x,-5.87,1.46),(x,-5.87,1.41)],.0035,brass)
 tube('Kitchen | utensil handle',[(x,-5.86,1.42),(x,-5.86,1.21)],.007,oak)
 orb('Kitchen | wooden spoon',(x,-5.86,1.17),(.028,.008,.045),oak)
current=collections['05 Study']
for i in range(5):book(-4.75,4.72,.82+i*.035,.23,.29,.03,[leather,green,linen][i%3])
for i in range(4):
 o=box('Study | dog-eared envelope',(-3.23+i*.025,4.79,.825+i*.003),(.21,.14,.002),paper,.001);o.rotation_euler.z=-.15+i*.06
text('Study | envelope addressee','For a rainy day',(-3.29,4.77,.842),.015,walnut,(0,0,-.1))
photo('Study | small portrait',-4.2,4.95,1.02,.20,.27,True)
# Slight irregularity in container silhouettes: no perfectly cloned jars.
for i,o in enumerate([o for o in scene.objects if o.name.startswith('Shelf | lidded storage')]):
 for v in o.data.vertices:
  v.co.x+=.002*sin(v.co.z*57+i);v.co.y+=.002*cos(v.co.z*49+i)
# Garden: gravel walk, a weathered fence, mature trees, layered foliage and leaf litter.
current=collections['01 Architecture']
for o in list(scene.objects):
 if o.name.startswith(('Garden | fine twig','Garden | bare branch')):bpy.data.objects.remove(o,do_unlink=True)
groundmat=mat('Garden | dry moss and soil',(.16,.19,.13),.97)
gravelmat=mat('Garden | old gravel',(.32,.31,.25),.95)
box('Garden | gravel path',(0,12,-.17),(1.65,8,.045),gravelmat,.025)
for i in range(11):
 x=.04*sin(i*.67);y=8.3+i*.58
 o=box('Garden | irregular stepping stone',(x,y,-.125),(.80+random.random()*.14,.42+random.random()*.10,.055),ceramic,.07);o.rotation_euler.z=random.uniform(-.10,.10)
for side in [-1,1]:
 for i in range(25):
  x=side*8.1;y=-7+i*.93
  box('Garden | fence picket',(x,y,.54),(.10,.15,1.32),oak,.025)
 for z in [.35,.87]:box('Garden | fence rails',(side*8.1,4,z),(.07,24,.08),oak,.01)
# Use one low-resolution leaf mesh repeatedly; instances share their mesh in Blender/GLB.
leafmat=mat('Garden | dusty green leaves',(.18,.22,.115),.8)
rustleaf=mat('Garden | autumn copper leaves',(.28,.19,.095),.85)
leafmesh=bpy.data.meshes.new('Garden leaf shared mesh');leafmesh.from_pydata([(-.07,0,0),(0,-.035,.012),(.11,0,0),(0,.035,.012),(0,0,.025)],[],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)]);leafmesh.update();leafmesh.materials.append(leafmat)
def leaf_instance(loc,scale=1):
 o=bpy.data.objects.new('Garden | individual leaf',leafmesh);current.objects.link(o);o.location=loc;o.rotation_euler=(random.uniform(-.7,.7),random.uniform(-.7,.7),random.uniform(0,pi*2));o.scale=(scale,scale,scale);return o
for ti,(x,y,h) in enumerate([(-8,-3.5,5.7),(-8.5,3,6.2),(8,-3,6),(8,3.5,6.4),(-4.5,11,5),(4.7,13,6),(-10,17,8),(11,19,8)]):
 lathe('Garden | mature bark trunk',x,y,-.18,[(.22,0),(.19,1.6),(.12,3.5),(.04,h)],walnut,12)
 for j in range(6):
  a=j*2.4+ti;bx=x+1.7*cos(a);by=y+1.7*sin(a);bz=h-.6+random.random()*.6
  tube('Garden | arching branches',[(x,y,h*.58),(x+.7*cos(a),y+.7*sin(a),h*.84),(bx,by,bz)],.035,walnut)
  for k in range(36):
   rr=random.random()**.5*1.1;aa=random.random()*2*pi
   leaf_instance((bx+rr*cos(aa),by+rr*sin(aa),bz+random.uniform(-.35,.45)),random.uniform(1.3,2.7))
# Bushy borders are layered behind the fence, not scattered spheres.
for x,y in [(-7,-4),(-6.8,3.7),(7,-3.5),(7.1,4),(-2.7,10),(3.6,11)]:
 for j in range(5):
  a=j*2.4;end=(x+.5*cos(a),y+.5*sin(a),.65+random.random()*.25)
  tube('Garden | shrub stem',[(x,y,-.1),end],.008,walnut)
  for k in range(24):leaf_instance((end[0]+random.uniform(-.4,.4),end[1]+random.uniform(-.4,.4),end[2]+random.uniform(-.25,.25)),random.uniform(1,1.8))
# Grass blades join later by material; silhouette detail is concentrated near windows and porch.
for i in range(650):
 x=random.uniform(-9,9);y=random.uniform(-7,16)
 if (abs(x)<6.15 and -6.5<y<8) or (abs(x)<1.1 and y>7):continue
 h=random.uniform(.08,.26);verts=[(x-.012,y,-.17),(x+.012,y,-.17),(x+.03,y+.02,h-.17)]
 mesh('Garden | grass blade',verts,[(0,1,2)],leafmat)
for i in range(80):
 x=random.uniform(-6.8,6.8);y=random.uniform(6.5,13)
 if abs(x)<.9:continue
 o=leaf_instance((x,y,-.12),random.uniform(.6,1.4));o.rotation_euler.x=0;o.rotation_euler.y=0
print('GEOMETRY POLISHED; removed',len(removed),'legacy chair pieces; objects',len(scene.objects))

# Material-specific colour/roughness/normal maps at modest amplitude, no checker-like bake.
N=512;rng=np.random.default_rng(49)
def smooth_noise(n=512,grid=16):
 a=rng.random((grid+1,grid+1));p=np.linspace(0,grid,n,endpoint=False);ii=p.astype(int);t=p-ii;t=t*t*(3-2*t)
 A=a[ii[:,None],ii[None,:]];B=a[ii[:,None]+1,ii[None,:]];C=a[ii[:,None],ii[None,:]+1];D=a[ii[:,None]+1,ii[None,:]+1]
 return (A*(1-t[:,None])+B*t[:,None])*(1-t[None,:])+(C*(1-t[:,None])+D*t[:,None])*t[None,:]
yy,xx=np.mgrid[0:N,0:N]/N
low=smooth_noise(N,5);medium=smooth_noise(N,30);fine=smooth_noise(N,130)
def img(name,array):
 image=bpy.data.images.new(name,width=N,height=N,alpha=True)
 rgba=np.ones((N,N,4),np.float32)
 if array.ndim==2:rgba[:,:,:3]=array[:,:,None]
 else:rgba[:,:,:3]=array
 image.pixels.foreach_set(rgba.ravel());image.pack();return image
patterns={}
for kind in ['wood','plaster','cloth','paint','ceramic','soil']:
 if kind=='wood':
  phase=yy*85+low*2.0+.35*np.sin(xx*11)
  grain=(np.sin(phase*2*pi)*.5+.5)*.30+medium*.3+fine*.10
  height=grain*.10;variation=(grain-.35)*.11+(low-.5)*.08
 elif kind=='cloth':
  weave=np.sin(xx*2*pi*180)*np.sin(yy*2*pi*180)
  height=weave*.015;variation=(medium-.5)*.025+(fine-.5)*.012
 elif kind=='plaster':height=(medium*.6+fine*.4)*.025;variation=(low-.5)*.035+(medium-.5)*.018
 elif kind=='paint':height=(fine-.5)*.012;variation=(medium-.5)*.025
 elif kind=='soil':height=(medium+fine)*.035;variation=(low-.5)*.10+(fine-.5)*.06
 else:height=(fine-.5)*.006;variation=(low-.5)*.02
 gy,gx=np.gradient(height);normal=np.stack((-gx*22,-gy*22,np.ones_like(gx)),axis=-1);normal/=np.linalg.norm(normal,axis=-1)[:,:,None]
 patterns[kind]=(variation,img('DY '+kind+' normal',normal*.5+.5))
def set_material(m,kind,color,rough=.65):
 nodes=m.node_tree.nodes;nodes.clear();lk=m.node_tree.links;p=nodes.new('ShaderNodeBsdfPrincipled');out=nodes.new('ShaderNodeOutputMaterial');lk.new(p.outputs[0],out.inputs[0])
 variation,normal=patterns[kind];color=np.array(color)
 image=img('DY '+m.name+' colour',np.clip(color[None,None,:]*(1+variation[:,:,None]),0,1))
 tex=nodes.new('ShaderNodeTexImage');tex.image=image;lk.new(tex.outputs['Color'],p.inputs['Base Color'])
 norm=nodes.new('ShaderNodeTexImage');norm.image=normal;normal.colorspace_settings.name='Non-Color';nm=nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.35;lk.new(norm.outputs['Color'],nm.inputs['Color']);lk.new(nm.outputs[0],p.inputs['Normal'])
 p.inputs['Roughness'].default_value=rough
 m.diffuse_color=(*color,1)
 return kind
kinds={}
for m in list(bpy.data.materials):
 name=m.name
 if name.startswith(('Smoked oak','Walnut','Chestnut leather')):
  c=(.24,.18,.12) if name.startswith('Smoked') else (.12,.085,.056)
  kinds[m.name]=set_material(m,'wood',c,.62)
 elif name.startswith(('Warm limewash',)):
  kinds[m.name]=set_material(m,'plaster',(.49,.48,.425),.94)
 elif name.startswith(('Flax linen','Washed cotton','Faded blue')):
  c=(.48,.43,.35) if name.startswith('Flax') else ((.66,.635,.56) if name.startswith('Washed') else (.20,.26,.27))
  kinds[m.name]=set_material(m,'cloth',c,.92)
 elif name.startswith(('Ivory painted','Oxidised sage')):
  c=(.55,.54,.48) if name.startswith('Ivory') else (.24,.29,.24)
  kinds[m.name]=set_material(m,'paint',c,.69)
 elif name.startswith(('Glazed stoneware','Crackled ivory')):kinds[m.name]=set_material(m,'ceramic',(.55,.54,.46),.28)
 elif name.startswith(('Garden earth','Garden | dry moss')):kinds[m.name]=set_material(m,'soil',(.16,.18,.115),.98)
# Stable metric-ish UVs for procedurally modelled meshes, independent of exporter guesswork.
for o in list(scene.objects):
 if o.type!='MESH' or not any(m and m.name in kinds for m in o.data.materials):continue
 me=o.data
 uv=me.uv_layers.active or me.uv_layers.new(name='UVMap')
 pts=[o.matrix_world@v.co for v in me.vertices]
 dims=o.dimensions;long_axis=max(range(3),key=lambda k:dims[k]);phase=(sum(ord(c) for c in o.name)%211)/37
 for poly in me.polygons:
  normal=o.matrix_world.to_3x3()@poly.normal;axis=max(range(3),key=lambda k:abs(normal[k]));axes=[k for k in range(3) if k!=axis]
  if dims[axes[1]]>dims[axes[0]]:axes.reverse()
  kind=kinds.get(me.materials[poly.material_index].name,'paint') if me.materials else 'paint'
  for li in poly.loop_indices:
   co=pts[me.loops[li].vertex_index]
   if kind=='wood':uv.data[li].uv=(co[axes[0]]*.7+phase,co[axes[1]]*1.8+phase*.3)
   elif kind=='cloth':uv.data[li].uv=(co[axes[0]]*1.1,co[axes[1]]*1.1)
   else:uv.data[li].uv=(co[axes[0]]*.65,co[axes[1]]*.65)
# Group static decoration and landscaping by material to keep runtime draw calls reasonable.
for c in collections.values():
 groups={}
 for o in list(c.objects):
  if o.type not in {'MESH','CURVE'} or o.hide_render:continue
  if not o.name.startswith(('Garden |','Kitchen | utensil','DY_Chair_','Throw | soft fringe','Kitchen | stacked','Hall | family')):continue
  matkey=tuple(m.name for m in o.data.materials);key=(o.name.split(' | ')[0],matkey)
  groups.setdefault(key,[]).append(o)
 for (prefix,key),obs in groups.items():
  if len(obs)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in obs:o.select_set(True)
  bpy.context.view_layer.objects.active=obs[0]
  bpy.ops.object.convert(target='MESH')
  bpy.ops.object.join();bpy.context.view_layer.objects.active.name=prefix+' | unified detail'
scene.camera=bpy.data.objects['01 Kitchen'];scene.render.resolution_percentage=70;scene.cycles.samples=32
scene['Asset revision']='Gameplay polish: complete chairs, weighted bedding, material-specific packed PBR maps, layered garden and lived-in decoration.'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_Game.blend'))
for camera,filename in [('01 Kitchen','game_kitchen_review.png'),('02 Bedroom','game_bedroom_review.png'),('05 Porch','game_porch_review.png')]:
 scene.camera=bpy.data.objects[camera];scene.render.filepath=os.path.join(OUT,filename);bpy.ops.render.render(write_still=True)
# Export only the current scene, all visible geometry. Old source is never overwritten.
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
import contextlib,io
buf=io.StringIO()
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','models','DogYears_Game.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
print('GAME ASSET EXPORT',len(scene.objects),'objects; file bytes',os.path.getsize(os.path.join(ROOT,'public','models','DogYears_Game.glb')))
