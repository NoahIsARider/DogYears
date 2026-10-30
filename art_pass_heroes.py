import bpy,os,math,random,json,contextlib,io
import numpy as np
from math import pi,sin,cos
from mathutils import Vector
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
art=bpy.data.collections['10 Art direction | Poly Haven CC0'];random.seed(49)
blue=bpy.data.materials['Art | scanned faded blue linen'];ivory=bpy.data.materials['Art | scanned washed ivory linen']
def solid(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
thread=solid('Art | faded shirt seam',(.31,.38,.38));button=solid('Art | mother of pearl buttons',(.66,.65,.58),.23);hole=solid('Art | button holes',(.045,.057,.055));wood=bpy.data.materials['Art | scanned old oak joinery'];brass=solid('Art | hanger brass',(.23,.19,.12),.38,.65)
def mesh(name,vs,fs,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);art.objects.link(o);me.materials.append(mat)
 for p in me.polygons:p.use_smooth=True
 uv=me.uv_layers.new(name='UVMap')
 for poly in me.polygons:
  for li in poly.loop_indices:
   co=me.vertices[me.loops[li].vertex_index].co;uv.data[li].uv=(co.x/1.4,co.z/1.4)
 return o
def tube(name,pts,r,mat,closed=False):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.bevel_depth=r;cu.bevel_resolution=2;cu.resolution_u=4;sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for p,c in zip(sp.bezier_points,pts):p.co=c;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 sp.use_cyclic_u=closed;o=bpy.data.objects.new(name,cu);art.objects.link(o);cu.materials.append(mat);return o
def shirt(cx,cy,scale,material,hero=False):
 prefix='Wardrobe | hanging shirt | '+('blue keepsake' if hero else 'layered linen')
 def world(x,y,z):return (cx+x*scale,cy+y*scale,1.86+(z-1.86)*scale)
 # Volumetric front/back, sloping shoulders and an open neck.
 profile=[(1.05,.235,.069),(1.12,.245,.068),(1.28,.232,.065),(1.45,.24,.066),(1.60,.25,.068),(1.71,.27,.061),(1.76,.26,.059),(1.81,.14,.050),(1.85,.074,.047)]
 vs=[];fs=[];seg=64
 for z,rx,ry in profile:
  for i in range(seg):
   a=i/seg*2*pi;fold=.0026*sin(a*9+z*13)+.0018*sin(a*17-z*8)
   vs.append(world(rx*cos(a),ry*sin(a)+fold,z+.002*sin(a*5+z*9)))
 for j in range(len(profile)-1):
  for i in range(seg):a=j*seg+i;b=j*seg+(i+1)%seg;fs.append((a,b,b+seg,a+seg))
 o=mesh(prefix+' body',vs,fs,material);mod=o.modifiers.new('Woven fabric thickness','SOLIDIFY');mod.thickness=.0018;mod=o.modifiers.new('Soft tailored body','SUBSURF');mod.levels=1
 for side in [-1,1]:
  # Sleeves are hollow tapered tubes with an elbow, not flat drapes.
  path=[(side*.235,0,1.68),(side*.30,-.004,1.57),(side*.36,-.008,1.42),(side*.39,-.008,1.27),(side*.37,-.012,1.13)]
  widths=[(.075,.052),(.072,.050),(.065,.045),(.056,.039),(.050,.033)]
  sv=[];sf=[];ns=32
  for j,(center,(r1,r2)) in enumerate(zip(path,widths)):
   tangent=Vector(path[min(j+1,len(path)-1)])-Vector(path[max(0,j-1)])
   tangent.normalize();u=Vector((0,1,0));v=tangent.cross(u).normalized()
   for k in range(ns):
    a=k/ns*2*pi;p=Vector(center)+u*(cos(a)*r2)+v*(sin(a)*r1);p.y+=.002*sin(a*6+j*2);sv.append(world(*p))
  for j in range(len(path)-1):
   for k in range(ns):a=j*ns+k;b=j*ns+(k+1)%ns;sf.append((a,b,b+ns,a+ns))
  o=mesh(prefix+' hollow sleeve',sv,sf,material);mod=o.modifiers.new('Sleeve hem thickness','SOLIDIFY');mod.thickness=.0018;mod=o.modifiers.new('Soft elbow folds','SUBSURF');mod.levels=1
  # Cuff bands are a second folded layer, visibly open at the wrist.
  cv=[];cf=[]
  for z,r1,r2 in [(1.115,.052,.035),(1.14,.054,.037),(1.195,.055,.038)]:
   for k in range(ns):a=k/ns*2*pi;cv.append(world(side*.37+sin(a)*r1,cos(a)*r2-.012,z))
  for j in range(2):
   for k in range(ns):a=j*ns+k;b=j*ns+(k+1)%ns;cf.append((a,b,b+ns,a+ns))
  cuff=mesh(prefix+' folded cuff',cv,cf,material);mod=cuff.modifiers.new('Folded cuff edge','SOLIDIFY');mod.thickness=.0025
  if hero:
   tube(prefix+' cuff seam',[world(side*.37+sin(k/ns*2*pi)*.055,cos(k/ns*2*pi)*.038-.012,1.19) for k in range(ns)],.0007,thread,True)
 # The collar band remains hollow; separate turn-down collar points form the familiar silhouette.
 cv=[];cf=[];ns=48
 for z,rx,ry in [(1.815,.081,.052),(1.858,.077,.050),(1.871,.082,.054)]:
  for i in range(ns):a=i/ns*2*pi;cv.append(world(rx*cos(a),ry*sin(a),z))
 for j in range(2):
  for i in range(ns):a=j*ns+i;b=j*ns+(i+1)%ns;cf.append((a,b,b+ns,a+ns))
 collar=mesh(prefix+' hollow collar band',cv,cf,material);mod=collar.modifiers.new('Folded collar thickness','SOLIDIFY');mod.thickness=.002
 for side in [-1,1]:
  pts=[world(side*.012,-.051,1.855),world(side*.085,-.052,1.84),world(side*.145,-.078,1.77),world(side*.090,-.095,1.697),world(side*.023,-.080,1.78)]
  flap=mesh(prefix+' turned collar point',pts,[(0,1,2),(0,2,4),(2,3,4)],material);mod=flap.modifiers.new('Collar fabric thickness','SOLIDIFY');mod.thickness=.002
  if hero:tube(prefix+' collar stitch',[world(side*.017,-.054,1.847),world(side*.08,-.056,1.832),world(side*.133,-.082,1.766),world(side*.091,-.098,1.714)],.0006,thread)
 if not hero:return
 # Curved front placket, chest patch pocket, buttons and seams are visible close up.
 ps=[];pf=[]
 for j in range(18):
  z=1.075+j*.040;y=-.071-.002*sin(z*13)
  for x in [-.014,.014]:ps.append(world(x,y,z))
 for j in range(17):a=j*2;pf.append((a,a+1,a+3,a+2))
 mesh(prefix+' button placket',ps,pf,material)
 tube(prefix+' placket stitching',[world(-.010,-.073,1.08),world(-.010,-.073,1.77)],.00065,thread)
 pocket=[world(.085,-.074,1.67),world(.185,-.073,1.665),world(.181,-.076,1.55),world(.135,-.078,1.53),world(.087,-.076,1.55)]
 mesh(prefix+' breast pocket',pocket,[(0,1,4),(1,2,3,4)],material);tube(prefix+' pocket stitched edge',pocket[1:]+[pocket[0]],.0007,thread)
 for i in range(7):
  z=1.11+i*.098;cx0,cy0,cz0=world(0,-.077,z);bv=[];bf=[];n=24
  for y,r in [(cy0+.001,.0068),(cy0-.001,.0072),(cy0-.002,.0057)]:
   for k in range(n):a=k/n*2*pi;bv.append((cx0+r*cos(a),y,cz0+r*sin(a)))
  for j in range(2):
   for k in range(n):a=j*n+k;b=j*n+(k+1)%n;bf.append((a,b,b+n,a+n))
  bv.append((cx0,cy0-.002,cz0));cc=len(bv)-1
  for k in range(n):bf.append((cc,n*2+k,n*2+(k+1)%n))
  mesh(prefix+' pearl button',bv,bf,button)
  for dx in [-.002,.002]:
   hs=[(cx0+dx+.001*cos(k/12*2*pi),cy0-.0024,cz0+.001*sin(k/12*2*pi)) for k in range(12)];mesh(prefix+' sewn button hole',hs,[tuple(range(12))],hole)
 tube(prefix+' shoulder yoke seam',[world(-.235,-.042,1.744),world(-.1,-.049,1.796),world(0,-.053,1.816),world(.1,-.049,1.796),world(.235,-.042,1.744)],.00075,thread)
 tube(prefix+' bottom hem',[world(.237*cos(i/64*2*pi),.070*sin(i/64*2*pi),1.065) for i in range(64)],.0008,thread,True)
 tube(prefix+' wooden hanger',[world(-.247,0,1.755),world(0,0,1.952),world(.247,0,1.755),world(-.247,0,1.755)],.007,wood)
 tube(prefix+' hanger hook',[world(0,0,1.95),world(0,0,2.01),world(.025,0,2.025),world(.030,0,2.00)],.0025,brass)
for o in list(s.objects):
 if o.name.startswith('Wardrobe | hanging shirt'):bpy.data.objects.remove(o,do_unlink=True)
shirt(4.02,-.64,.61,ivory);shirt(4.99,-.64,.60,ivory);shirt(4.30,-.57,.63,ivory);shirt(4.50,-.89,1.0,blue,True)
# All remaining woven surfaces use the scanned cloth rather than generated noise.
rug=ivory.copy();rug.name='Art | washed neutral woven rug'
for o in s.objects:
 if o.type!='MESH' or o.name.startswith('Wardrobe | hanging shirt'):continue
 for i,m in enumerate(o.data.materials):
  if not m:continue
  if m.name.startswith(('Flax linen','Washed cotton')):o.data.materials[i]=rug if 'rug' in o.name.lower() or 'runner' in o.name.lower() else ivory
  elif m.name.startswith('Faded blue blanket'):o.data.materials[i]=blue
# A barely-visible pressure trace replaces the proud, perfectly circular dark tube.
for o in list(s.objects):
 if o.name.startswith('Porch | faint circular worn patch'):bpy.data.objects.remove(o,do_unlink=True)
N=256;y,x=np.mgrid[-1:1:complex(N),-1:1:complex(N)];r=np.sqrt((x*1.02)**2+(y*.97)**2);a=np.arctan2(y,x);rng=np.random.default_rng(7);noise=rng.random((N,N))
alpha=.065*np.exp(-((r-(.76+.015*np.sin(a*3)+.012*np.sin(a*7)))/.085)**2)*(.26+.40*(np.sin(a*2.7+.7)*.5+.5)+noise*.16)+.010*np.exp(-(r/.64)**4)
rgba=np.ones((N,N,4),np.float32);rgba[:,:,:3]=(.38,.345,.28);rgba[:,:,3]=np.clip(alpha,0,.08)
im=bpy.data.images.new('Art | feathered porch wear',width=N,height=N,alpha=True);im.pixels.foreach_set(rgba.ravel());im.pack();m=bpy.data.materials.new('Art | faint pressure discoloration');m.use_nodes=True;nodes=m.node_tree.nodes;lk=m.node_tree.links;p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED');tex=nodes.new('ShaderNodeTexImage');tex.image=im;lk.new(tex.outputs['Color'],p.inputs['Base Color']);lk.new(tex.outputs['Alpha'],p.inputs['Alpha']);p.inputs['Roughness'].default_value=.85
try:m.surface_render_method='DITHERED'
except:pass
o=mesh('Porch | faint circular worn patch',[(-1.18,6.87,.0015),(-.12,6.87,.0015),(-.12,7.93,.0015),(-1.18,7.93,.0015)],[(0,1,2,3)],m)
uv=o.data.uv_layers.active
for poly in o.data.polygons:
 for li in poly.loop_indices:
  co=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=((co.x+1.18)/1.06,(co.y-6.87)/1.06)
o['noShadow']=True;o['pressureMark']=True
# Remove unused intermediate imported data; originals remain under reference/assets.
try:bpy.data.orphans_purge(do_local_ids=True,do_linked_ids=False,do_recursive=True)
except:pass
data=bpy.data.cameras.new('08 Wardrobe detail');cam=bpy.data.objects.new('08 Wardrobe detail',data);s.collection.objects.link(cam);cam.location=(3.24,-2.0,1.66);cam.rotation_euler=(Vector((4.48,-.86,1.43))-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=43
s.render.resolution_percentage=75;s.cycles.samples=32
for c,f in [('08 Wardrobe detail','art_shirt_review.png'),('05 Porch','art_porch_review.png')]:s.camera=bpy.data.objects[c];s.render.filepath=os.path.join(OUT,f);bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['01 Kitchen']
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_ArtPass.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
buf=io.StringIO();dest=os.path.join(ROOT,'public','models','DogYears_ArtPass.glb')
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=dest,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=True)
print('ART PASS EXPORTED',os.path.getsize(dest),'bytes')
