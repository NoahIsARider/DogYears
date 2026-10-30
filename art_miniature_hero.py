import bpy,os,math,random,contextlib,io
from mathutils import Vector
from math import pi,sin,cos
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene;random.seed(49)
col=bpy.data.collections.new('12 Hero | unfinished handmade house');s.collection.children.link(col)
for o in list(s.objects):
 if o.name.startswith(('Model |','Workshop | loose timber')):bpy.data.objects.remove(o,do_unlink=True)
def choose(p):return max([m for m in bpy.data.materials if m.name.startswith(p)],key=lambda m:m.users)
wood=choose('Art | scanned old oak joinery');plaster=bpy.data.materials['Art | scanned aged lime plaster'];dark=choose('Art | scanned furniture walnut')
def material(n,c,r=.8,metal=0):
 m=bpy.data.materials.new(n);m.use_nodes=True;p=next(x for x in m.node_tree.nodes if x.type=='BSDF_PRINCIPLED');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=r;p.inputs['Metallic'].default_value=metal;return m
slate=material('Model | hand-painted roof',(.28,.285,.25),.9);glue=material('Model | dry hide glue',(.55,.46,.29),.4);pins=material('Model | inset brads',(.16,.14,.10),.4,.55)
def box(n,loc,size,m=wood,b=.0005):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.view_layer.objects.active;o.name='Model | '+n;o.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for c in list(o.users_collection):c.objects.unlink(o)
 col.objects.link(o);o.data.materials.append(m)
 if b:mod=o.modifiers.new('Hand cut edge','BEVEL');mod.width=b;mod.segments=1
 uv=o.data.uv_layers.active
 for p in o.data.polygons:
  aa=[k for k in range(3) if k!=max(range(3),key=lambda k:abs(p.normal[k]))]
  for li in p.loop_indices:
   co=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(co[aa[0]]*9+loc[aa[0]]*.8,co[aa[1]]*9+loc[aa[1]]*.8)
 return o
def beam(n,a,b,w=.008,d=.009):
 a=Vector(a);b=Vector(b);o=box(n,(a+b)/2,(w,d,(b-a).length));o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
L=-5.075;R=-4.525;F=2.55;B=3.0;floor=.87;eave=1.105;ridge=1.175
for i in range(20):
 x=L+.01375+i*.0275;split=2.73 if i%2 else 2.84
 for a,b in [(F+.006,split),(split+.0007,B-.006)]:box('individual floorboard',(x,(a+b)/2,.862),(.027,b-a,.012),wood,.00025)
for y in [F,B]:box('wall sill',(-4.8,y,.881),(.55,.013,.014))
for x in [L,R]:box('side sill',(x,2.775,.881),(.013,.45,.014))
# Door leaf remains entirely runtime-owned: opening x[-4.90,-4.74], z[.87,1.09].
for x in [L,R,-4.906,-4.734]:box('front upright',(x,F,.9875),(.010,.012,.235))
box('front top plate',(-4.8,F,eave),(.57,.013,.013));box('door header',(-4.82,F,1.100),(.188,.015,.012),dark)
for x in [-4.906,-4.734]:box('door jamb',(x,F-.001,.984),(.009,.016,.226),dark,.0004)
box('threshold',(-4.82,F-.008,.869),(.174,.028,.007),dark)
fw=-4.99;w0=fw-.045;w1=fw+.045
box('plaster below front window',((L-4.914)/2,F+.004,.909),(-4.914-L,.007,.058),plaster)
box('plaster above front window',((L-4.914)/2,F+.004,1.073),(-4.914-L,.007,.050),plaster)
for a,b in [(L+.005,w0),(w1,-4.914)]:
 if b>a:box('front plaster pier',((a+b)/2,F+.004,.990),(b-a,.007,.108),plaster)
box('partial front plaster',(-4.625,F+.004,.956),(.195,.007,.156),plaster)
for x in [L,R,-4.91,-4.71]:box('rear timber stud',(x,B,.9875),(.009,.011,.235))
box('rear top plate',(-4.8,B,eave),(.57,.012,.012));box('rear plaster lower',(-4.81,B-.002,.953),(.52,.006,.154),plaster);box('rear upper plaster fragment',(-4.952,B-.002,1.059),(.236,.006,.056),plaster)
for x in [L,R]:
 box('side top plate',(x,2.775,eave),(.012,.47,.012))
 for y in [2.64,2.915]:box('side stud',(x,y,.988),(.010,.010,.232))
 box('lower side plaster',(x,2.775,.907),(.007,.43,.060),plaster);box('upper side plaster',(x,2.775,1.079),(.007,.43,.045),plaster)
 for a,b in [(2.56,2.69),(2.85,2.99)]:box('side plaster pier',(x,(a+b)/2,.995),(.007,b-a,.110),plaster)
 for y in [2.69,2.85]:box('window stile',(x,y,.997),(.014,.007,.129),dark,.0003)
 for z in [.936,1.058]:box('window rail',(x,2.77,z),(.014,.167,.007),dark,.0003)
 box('window center mullion',(x,2.77,.997),(.014,.0034,.117),wood,.0002);box('window crossbar',(x,2.77,.997),(.014,.155,.0034),wood,.0002);box('projecting sill',(x,2.77,.929),(.024,.184,.006),dark,.0004)
for x in [w0,w1]:box('front window stile',(x,F-.003,.990),(.006,.014,.119),dark,.0003)
for z in [.936,1.045]:box('front window rail',(fw,F-.003,z),(.098,.014,.006),dark,.0003)
box('front window mullion',(fw,F-.005,.990),(.003,.014,.104),wood,.0002);box('front window crossbar',(fw,F-.005,.990),(.086,.014,.003),wood,.0002);box('front projecting sill',(fw,F-.009,.930),(.112,.028,.006),dark,.0004)
for x in [L+.012,R-.012]:box('interior skirting',(x,2.775,.884),(.005,.425,.018),dark,.0003)
box('rear skirting',(-4.8,B-.012,.884),(.526,.005,.018),dark,.0003);box('unfinished room partition',(-4.66,2.82,.934),(.006,.19,.110),plaster,.0004);beam('diagonal brace',(L,2.60,.89),(L,2.90,1.08),.005,.006)
for y in [F,2.775,B]:
 beam('complete left roof rafter',(L-.013,y,eave),(-4.8,y,ridge),.010,.010);box('ceiling tie',(-4.8,y,eave-.004),(.565,.008,.008),wood,.0003)
 if y!=2.775:beam('right end rafter',(-4.8,y,ridge),(R+.013,y,eave))
beam('ridge timber',(-4.8,F-.008,ridge),(-4.8,B+.008,ridge),.009,.010)
angle=-math.atan2(ridge-eave,.288)
for j in range(3):
 x=L+.030+j*.055;z=eave+(x-(L-.013))*(ridge-eave)/.288+.004;o=box('partial roof sheathing',(x,2.775,z),(.056,.47,.003),wood,.0003);o.rotation_euler.y=angle
for row in range(4):
 x=L+.020+row*.040
 for j in range(7):
  y=F-.006+j*.067+(0.029 if row%2 else 0)
  if y>B+.018:continue
  z=eave+(x-(L-.013))*(ridge-eave)/.288+.008+row*.0008;o=box('hand cut roof shingle',(x,y,z),(.047,.066,.0022),slate,.00035);o.rotation_euler.y=angle+random.uniform(-.008,.008)
for j in range(3):
 x=R-.018-j*.035;z=eave+(R+.013-x)*(ridge-eave)/.288+.006;o=box('right rear roof sample',(x,2.953,z),(.042,.112,.0025),slate,.0003);o.rotation_euler.y=-angle
for x in [L,R,-4.906,-4.734]:
 for z in [.892,1.092]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,location=(x,F-.007,z));o=bpy.context.view_layer.objects.active;o.name='Model | brad head';o.scale=(.0012,.0005,.0012)
  for c in list(o.users_collection):c.objects.unlink(o)
  col.objects.link(o);o.data.materials.append(pins)
for x in [L+.004,R-.004]:
 for y in [F+.01,B-.01]:box('glue squeeze out',(x,y,.886),(.012,.010,.0012),glue,.0004)
for i in range(3):
 o=box('uninstalled roof offcut',(-4.98+i*.06,3.13,.863),(.027,.125-i*.015,.006),wood,.0004);o.rotation_euler.z=-.09+i*.07
groups={}
for o in col.objects:groups.setdefault(o.data.materials[0].name,[]).append(o)
for name,obs in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.select_set(True)
 bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.convert(target='MESH');bpy.ops.object.join();bpy.context.view_layer.objects.active.name='Model | handmade miniature | '+name
data=bpy.data.cameras.new('10 Miniature hero');cam=bpy.data.objects.new('10 Miniature hero',data);s.collection.objects.link(cam);cam.location=(-4.19,2.09,1.43);cam.rotation_euler=(Vector((-4.8,2.79,1.01))-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=48
s.camera=cam;s.render.resolution_percentage=85;s.cycles.samples=24;s.render.filepath=os.path.join(OUT,'art_miniature_hero.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['01 Kitchen'];bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_ArtPass.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
dest=os.path.join(ROOT,'public','models','DogYears_ArtPass_Hero_raw.glb');buf=io.StringIO()
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=dest,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=True,export_image_format='WEBP',export_image_quality=86)
print('MINIATURE HERO EXPORTED',os.path.getsize(dest),'bytes')
