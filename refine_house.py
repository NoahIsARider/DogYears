import bpy,math,random,os
from mathutils import Vector,Matrix
from math import pi,sin,cos
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables')
scene=bpy.context.scene;collections={c.name:c for c in scene.collection.children};current=collections['03 Kitchen']
source=open(os.path.join(ROOT,'build_house.py'),encoding='utf-8').read()
exec(source[source.index('def put'):source.index('# Architectural shell')])
random.seed(721)
for o in list(scene.objects):
 if o.name.startswith('Chair |'):bpy.data.objects.remove(o,do_unlink=True)
current=collections['03 Kitchen'];chair(-3.1,-1.7,pi+.15);chair(-3.35,-3.4,-.25)
current=collections['05 Study'];chair(-3.55,3.75,pi+.12)
for o in scene.objects:
 if o.type=='MESH' and ('Duvet' in o.name or 'Throw | faded' in o.name):
  for v in o.data.vertices:v.co.z+=.018*sin(v.co.x*13+v.co.y*7)*cos(v.co.y*11)-.025*sin(v.co.x*40+v.co.y*8)
 if 'Pillow | old hollow' in o.name and o.type=='MESH':
  for v in o.data.vertices:
   if v.co.z>.82:v.co.z-=.10*math.exp(-((v.co.x-3.83)**2+(v.co.y+4.22)**2)/.028)
current=collections['03 Kitchen']
# Variation on shelves: jars, a small stack of plates, and empty spaces.
for i,o in enumerate([o for o in scene.objects if o.name.startswith('Shelf | lidded')]):
 if i in [1,4,8,11]:bpy.data.objects.remove(o,do_unlink=True)
 elif i%3==0:o.data.materials.clear();o.data.materials.append(terracotta)
for i,o in enumerate([o for o in scene.objects if o.name.startswith('Jar | wooden lid')]):
 if i in [1,4,8,11]:bpy.data.objects.remove(o,do_unlink=True)
tile=mat('Crackled ivory tile',(.38,.41,.37),.3,noise=.08)
for j in range(3):
 for i in range(19):box('Backsplash | handmade tile',(-5.16+i*.195,-5.985,1.04+j*.15),(.19,.018,.144),tile,.006)
box('Range | enamel fascia',(-1.81,-5.07,.49),(.65,.05,.66),iron,.035)
box('Range | oven glass',(-1.81,-5.035,.43),(.51,.018,.35),black,.025)
tube('Range | oven handle',[(-2.05,-4.99,.69),(-2.05,-4.96,.72),(-1.57,-4.96,.72),(-1.57,-4.99,.69)],.014,brass)
for i in range(4):orb('Range | control knob',(-2.04+i*.15,-5.025,.77),(.026,.018,.026),brass)
box('Range | iron hob',(-1.82,-5.55,.948),(.64,.66,.025),iron)
for x in [-1.99,-1.66]:
 for y in [-5.72,-5.39]:
  lathe('Burner | rings',x,y,.965,[(.04,0),(.075,.005),(.076,.018),(.065,.018),(.064,.005),(.04,.005)],iron,48)
  for k in range(4):a=k*pi/2;tube('Burner | trivet',[(x+.09*cos(a),y+.09*sin(a),.98),(x+.04*cos(a),y+.04*sin(a),.99)],.007,iron)
for i in range(7):
 y=-5.77+i*.063;tube('Dish rack | bent wire',[(-4.98,y,.96),(-4.98,y,1.16),(-4.59,y,1.16),(-4.59,y,.96)],.005,brass)
for y in [-5.72,-5.55]:
 o=lathe('Washed plate',0,0,0,[(0,0),(.12,0),(.15,.02),(.15,.026),(.12,.008),(0,.008)],ceramic);o.rotation_euler.x=pi/2;o.location=(-4.79,y,1.1)
cloth('Tea towel | left drying',-2.91,-5.20,.968,.29,.56,white,.006,.05)
def frame(n,x,y,z,w,h):
 box(n+' | walnut frame',(x,y,z),(w,.055,h),walnut,.014)
 box(n+' | blank faded photograph',(x,y-.031,z),(w-.065,.008,h-.065),paper,.001)
 for j in range(6):
  zz=z-h*.26+j*.09;ww=(w-.15)*(.7+.25*sin(j*1.4))
  tube(n+' | landscape lines',[(x-ww/2,y-.038,zz),(x-ww*.2,y-.038,zz+.06),(x+ww*.15,y-.038,zz-.02),(x+ww/2,y-.038,zz+.03)],.005,green)
current=collections['04 Bedroom'];frame('Bedroom | empty landscape',3.35,-5.975,1.92,1.05,.65)
for x in [4.72,4.81]:tube('Reading glasses | fine rim',[(x+.036*cos(i*2*pi/40),-4.12+.026*sin(i*2*pi/40),.67) for i in range(40)],.002,brass,True)
tube('Reading glasses | bridge',[(4.753,-4.12,.67),(4.765,-4.12,.676),(4.777,-4.12,.67)],.002,brass)
box('Keepsake | leather box',(4.85,-4.4,.71),(.29,.19,.10),leather,.016);box('Keepsake | lid',(4.85,-4.4,.772),(.30,.20,.026),leather,.012)
box('Keepsake | clasp',(4.85,-4.295,.745),(.035,.012,.03),brass,.004)
current=collections['05 Study']
for i in range(20):box('Study | beadboard',(-5.3+i*.21,5.98,.43),(.20,.025,.84),green,.004)
box('Study | dado rail',(-3.2,5.94,.89),(4.5,.055,.06),oak)
for i in range(3):book(-2.65,4.83,.88+i*.045,.19,.27,.04)
lathe('Pen | brass cup',-2.55,4.51,.82,[(0,0),(.042,0),(.043,.10),(.038,.105),(.036,.01),(0,.01)],brass)
for i in range(5):tube('Pencil | graphite',[(-2.58+i*.014,4.51,.83),(-2.61+i*.026,4.50,1.02+random.random()*.05)],.003,oak)
current=collections['06 Back porch']
table('Reading nook | low table',3.2,4.7,1.0,.65,.44);book(3.2,4.7,.48,.19,.26,.04)
for x in [2.3,4.1]:
 for y in [2.8,3.7]:leg(x,y,0,.26)
box('Settee | wooden base',(3.2,3.25,.35),(2.05,1.1,.22),walnut,.05)
box('Settee | linen back',(3.2,3.74,.83),(2.05,.20,.95),linen,.10)
for x in [2.22,4.18]:box('Settee | rolled arm',(x,3.25,.66),(.20,1.10,.55),linen,.09)
for x in [2.72,3.68]:cushion('Settee | piped seat',x,3.22,.54,.88,.88,linen)
cushion('Settee | blue cushion',3.73,3.60,.88,.52,.24,blue)
# No lush crowns outside: bare garden branches against a grey sky.
current=collections['01 Architecture']
for o in list(scene.objects):
 if o.name.startswith('Garden | soft foliage'):bpy.data.objects.remove(o,do_unlink=True)
for o in [o for o in scene.objects if o.name.startswith('Garden | tree trunk')]:
 center=o.data.vertices[0].co;x=center.x-.16;y=center.y
 for j in range(5):
  a=j*2.4;z=2.3+j*.4;end=(x+1.3*cos(a),y+1.3*sin(a),z+1.2)
  tube('Garden | bare branch',[(x,y,z),(x+.7*cos(a),y+.7*sin(a),z+.4),end],.017,walnut)
  for k in [-1,1]:tube('Garden | fine twig',[end,(end[0]+k*.4,end[1]+.3,end[2]+.5)],.005,walnut)
# Wilted stems and dropped leaves, not ornamental greenery.
for o in scene.objects:
 if o.name.startswith('Plant | leaf'):o.rotation_euler.y+=1.05
 if o.type=='MESH' and o.name.startswith('Plant | leaf'):
  o.data.materials.clear();o.data.materials.append(mat('Withered leaf',(.13,.12,.075),.95))
for i in range(14):
 x=-4.0+random.random()*1.7;y=-3.6+random.random()*2.2
 o=orb('Fallen | dry leaf',(x,y,.013),(.045,.018,.004),leather);o.rotation_euler.z=random.random()*pi
# Cold, quiet palette: green-grey plaster, dark wood, very small warm remnants.
for m in bpy.data.materials:
 if not m.use_nodes:continue
 p=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
 if not p:continue
 def grade(c):
  lum=c[0]*.23+c[1]*.64+c[2]*.13
  return tuple((lum*.66+c[i]*.34)*[.70,.77,.81][i] for i in range(3))+(1,)
 p.inputs['Base Color'].default_value=grade(p.inputs['Base Color'].default_value)
 for node in m.node_tree.nodes:
  if node.type=='VALTORGB':
   for el in node.color_ramp.elements:el.color=grade(el.color)
  if node.type=='BUMP':node.inputs['Distance'].default_value=.005
for o in collections['07 Lighting'].objects:
 if o.type!='LIGHT':continue
 if o.name.startswith('Window'):
  o.data.energy=160;o.data.color=(.64,.77,.90);o.data.size=1.8
 elif o.name.startswith('Bounce'):o.data.energy=22;o.data.color=(.66,.74,.80)
 elif o.name.startswith('Lamp glow'):o.data.energy=0 if o.location.x>0 else 9;o.data.color=(1,.64,.32)
 elif o.data.type=='SUN':o.data.energy=.8;o.data.color=(.68,.76,.82);o.data.angle=.025;o.rotation_euler=(Vector((0,0,.2))-Vector((-14,-5,3))).to_track_quat('-Z','Y').to_euler()
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.25,.32,.39,1);bg.inputs[1].default_value=.23
scene.view_settings.exposure=-.25
# Subtle window rain streaks, physically modelled on the exterior plane.
rain=mat('Rain | cold glass',(.27,.34,.38),.12,.35)
for x in [-5.58,5.58]:
 for cy in [-3.5,3.1]:
  for i in range(24):
   y=cy+random.uniform(-.95,.95);z=random.uniform(1.15,2.5)
   tube('Window | rain trace',[(x,y,z),(x,y+.008,z-.06),(x,y+.003,z-random.uniform(.09,.25))],.0015,rain)
scene.camera=bpy.data.objects['01 Kitchen'];scene.cycles.samples=32;scene.render.resolution_percentage=65
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_House.blend'))
print('REFINED',len(scene.objects),'objects')
