import bpy,os,math,random,contextlib,io
import numpy as np
from math import sin,cos,pi
from mathutils import Vector
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
random.seed(7149);col=bpy.data.collections.get('09 Garden depth | ridges and forest')
# Replace every previous crown/silhouette, not merely cover primitive shapes with more detail.
for o in list(col.objects):
 if not o.name.startswith('Landscape | ridge '):bpy.data.objects.remove(o,do_unlink=True)
for o in list(col.objects):
 b=int(o.name[-1])-1;factor=[.28,.45,.44][b]
 for v in o.data.vertices:v.co.z=(v.co.z-[0,1.5,3][b])*factor+[-.2,.0,.25][b]
def mat(name,c):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*c,1);p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.92;return m
mats=[mat('Natural foliage | shaded olive',(.115,.165,.085)),mat('Natural foliage | dusty green',(.19,.245,.13)),mat('Natural foliage | light edge',(.245,.285,.16)),mat('Natural foliage | dry leaves',(.29,.235,.12)),mat('Natural foliage | distant grey green',(.27,.325,.27)),mat('Natural bark | weathered',(.12,.115,.085))]
buffers=[([],[]) for _ in mats]
def addmesh(verts,faces,index):
 vs,fs=buffers[index];offset=len(vs);vs.extend(verts);fs.extend(tuple(offset+i for i in f) for f in faces)
def segment(a,b,r0,r1,index=5,sides=6):
 a=Vector(a);b=Vector(b);direction=(b-a).normalized();basis=direction.cross(Vector((0,0,1)))
 if basis.length<.01:basis=Vector((1,0,0))
 else:basis.normalize()
 other=direction.cross(basis).normalized();vs=[];fs=[]
 for point,r in [(a,r0),(b,r1)]:
  for i in range(sides):p=point+(basis*cos(i*2*pi/sides)+other*sin(i*2*pi/sides))*r;vs.append(tuple(p))
 for i in range(sides):j=(i+1)%sides;fs.append((i,j,j+sides,i+sides))
 addmesh(vs,fs,index)
def leaf(center,length,index,angle,tilt):
 # An actual tapered, slightly cupped leaf: visible serrated outline, never a circular crown.
 c=Vector(center);u=Vector((cos(angle),sin(angle),tilt)).normalized()*length;v=Vector((-sin(angle),cos(angle),.10))*length*.36
 pts=[c-u*.56,c-u*.20+v*.8,c+u*.22+v*.66,c+u*.58,c+u*.13-v*.72,c-u*.22-v*.78,c+Vector((0,0,length*.08))]
 addmesh([tuple(p) for p in pts],[(6,i,(i+1)%6) for i in range(6)],index)
def spray(start,end,near,index):
 start=Vector(start);end=Vector(end);segment(start,end,.006 if near else .004,.0015,sides=4)
 tangent=end-start
 n=10 if near else 6
 for j in range(n):
  t=(j+.5)/n;pos=start+tangent*t
  a=math.atan2(tangent.y,tangent.x)+(1 if j%2 else -1)*1.05
  side=Vector((cos(a),sin(a),.12))*(.11 if near else .15)
  c=pos+side
  leaf(c,.13 if near else .18,index if random.random()>.13 else min(3,index+1),a,random.uniform(-.45,.45))
  if near and j%2==0:leaf(pos-side*.65,.11,index,a+pi,random.uniform(-.3,.3))
def tree(x,y,z,h,near=False,seed=0,far=False):
 rng=random.Random(seed);lean=Vector((rng.uniform(-.25,.25),rng.uniform(-.25,.25),0));base=Vector((x,y,z));split=base+Vector((lean.x,lean.y,h*.46));top=base+Vector((lean.x*.6,lean.y*.6,h*.92))
 segment(base,split,h*.032,h*.018,sides=9 if near else 6);segment(split,top,h*.018,.012,sides=7 if near else 5)
 branch_count=12 if near else (8 if not far else 6)
 for j in range(branch_count):
  a=j*2.399+seed*.37;level=.37+(j/branch_count)*.4
  origin=base+Vector((lean.x,lean.y,h*level));reach=h*(.27 if near else .24)*(1-(level-.37)*.60)
  elbow=origin+Vector((cos(a)*reach*.55,sin(a)*reach*.55,h*.09));end=origin+Vector((cos(a)*reach,sin(a)*reach,h*(.22-rng.random()*.05)))
  segment(origin,elbow,.035 if near else .023,.015,sides=6);segment(elbow,end,.015,.003,sides=5)
  twigs=5 if near else (4 if not far else 3)
  for k in range(twigs):
   q=(k+.5)/twigs;root=elbow.lerp(end,q);aa=a+(k%2*2-1)*(.7+rng.random()*.4)
   tip=root+Vector((cos(aa)*reach*.35,sin(aa)*reach*.35,h*.06))
   spray(root,tip,near,4 if far else rng.choice([0,0,1,1,2,3]))
 # airy leader sprays preserve an irregular top silhouette
 for k in range(5 if near else 3):
  a=k*2.4;end=top+Vector((cos(a)*h*.15,sin(a)*h*.15,h*.10))
  spray(top,end,near,4 if far else 1)
# Fine branches and leaves in the mid-ground, with deliberate gaps toward the distant ridges.
positions=[(-10,-4),(-11,3),(-8,12),(-4.5,17),(5.5,17),(9,12),(11,5),(10,-4),(6,-12),(-2,-15),(-8,-11)]
for i,(x,y) in enumerate(positions):tree(x,y,-.20,random.uniform(4.5,6.5),True,100+i)
def crest(a,b):
 old=[4.6,10.4,17.8][b]+[1.4,2.7,4.1][b]*(.6*sin(a*3+b*.8)+.27*sin(a*7+1.4)+.13*sin(a*13+.7))
 return old*[.28,.45,.44][b]+[-.2,0,.25][b]
for b,(radius,count) in enumerate([(28,36),(47,48),(71,64)]):
 for i in range(count):
  a=i/count*2*pi+random.uniform(-.026,.026)
  if i%13==0:continue
  r=radius+random.uniform(-1.2,1.2)
  tree(r*cos(a),r*sin(a),crest(a,b)-.15,random.uniform(3.3,5.0),False,2000+b*100+i,b>0)
for index,(vs,fs) in enumerate(buffers):
 if not vs:continue
 me=bpy.data.meshes.new(mats[index].name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(mats[index].name,me);col.objects.link(o);me.materials.append(mats[index])
 for p in me.polygons:p.use_smooth=index==5
# Fine, irregular soil variation in world-consistent UVs. No grid, checker or broad colour stripes.
N=512;rng=np.random.default_rng(1949)
def noise(grid):
 a=rng.random((grid+1,grid+1));p=np.linspace(0,grid,N,endpoint=False);ii=p.astype(int);t=p-ii;t=t*t*(3-2*t)
 A=a[ii[:,None],ii[None,:]];B=a[ii[:,None]+1,ii[None,:]];C=a[ii[:,None],ii[None,:]+1];D=a[ii[:,None]+1,ii[None,:]+1]
 return (A*(1-t[:,None])+B*t[:,None])*(1-t[None,:])+(C*(1-t[:,None])+D*t[:,None])*t[None,:]
v=(noise(5)-.5)*.10+(noise(31)-.5)*.06+(noise(170)-.5)*.045
for m in [bpy.data.materials.get('Garden earth'),bpy.data.materials.get('Garden | dry moss and soil')]+[bpy.data.materials.get(n) for n in ['Distance | wooded ground','Distance | middle blue green','Distance | far blue grey']]:
 if not m:continue
 nodes=m.node_tree.nodes;links=m.node_tree.links;p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED');base=m.diffuse_color[:3]
 arr=np.ones((N,N,4),np.float32);arr[:,:,:3]=np.clip(np.array(base)[None,None,:]*(1+v[:,:,None]),0,1)
 im=bpy.data.images.new('Fine earth | '+m.name,width=N,height=N,alpha=True);im.pixels.foreach_set(arr.ravel());im.pack()
 tex=nodes.new('ShaderNodeTexImage');tex.image=im;links.new(tex.outputs['Color'],p.inputs['Base Color']);p.inputs['Roughness'].default_value=.98
for o in s.objects:
 if o.type!='MESH' or not (o.name.startswith('Landscape | ridge') or o.name.startswith('Garden | surrounding')):continue
 uv=o.data.uv_layers.active or o.data.uv_layers.new(name='UVMap')
 for poly in o.data.polygons:
  for li in poly.loop_indices:
   co=o.matrix_world@o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(co.x/11,co.y/11)
s.camera=bpy.data.objects['07 Garden'];s.render.resolution_percentage=70;s.cycles.samples=24;s.render.filepath=os.path.join(OUT,'game_garden_natural.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['01 Kitchen'];s.render.filepath=os.path.join(OUT,'game_kitchen_natural.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_Game.blend'))
buf=io.StringIO()
with contextlib.redirect_stdout(buf):
 bpy.ops.object.select_all(action='DESELECT')
 for o in col.objects:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','models','DogYears_Garden.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
 bpy.ops.object.select_all(action='DESELECT')
 for o in s.objects:
  if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
 nextfile=os.path.join(ROOT,'public','models','DogYears_Game_next.glb')
 bpy.ops.export_scene.gltf(filepath=nextfile,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
 os.replace(nextfile,os.path.join(ROOT,'public','models','DogYears_Game.glb'))
print('NATURAL SCENERY: lower ridges + branching leaf sprays; triangles added',sum(len(fs) for vs,fs in buffers),'full bytes',os.path.getsize(os.path.join(ROOT,'public','models','DogYears_Game.glb')))
