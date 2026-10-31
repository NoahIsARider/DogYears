import bpy, math, random, os, json
from mathutils import Vector
from math import sin, cos, pi
random.seed(49)
def _repo_root(start):
    p=os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(p,'package.json')) and os.path.dirname(p)!=p:
        p=os.path.dirname(p)
    return p

ROOT=_repo_root(__file__)
OUT=os.path.join(ROOT,'deliverables'); os.makedirs(OUT,exist_ok=True)
scene=bpy.data.scenes.new('DogYears | The waiting house')
bpy.context.window.scene=scene
scene.unit_settings.system='METRIC'
collections={}
for n in ['01 Architecture','02 Entry','03 Kitchen','04 Bedroom','05 Study','06 Back porch','07 Lighting','08 Ceiling']:
 c=bpy.data.collections.new(n); scene.collection.children.link(c); collections[n]=c
current=collections['01 Architecture']
def put(o,name,mat=None):
 o.name=name
 for c in list(o.users_collection): c.objects.unlink(o)
 current.objects.link(o)
 if mat: o.data.materials.append(mat)
 return o
def mat(name,col,rough=.6,metal=0,noise=0,scale=(1,1,1)):
 m=bpy.data.materials.new(name); m.diffuse_color=(*col,1); m.use_nodes=True
 nd=m.node_tree.nodes; lk=m.node_tree.links; p=next(n for n in nd if n.type=='BSDF_PRINCIPLED')
 p.inputs['Base Color'].default_value=(*col,1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
 if noise:
  tex=nd.new('ShaderNodeTexNoise'); tex.inputs['Scale'].default_value=5; tex.inputs['Detail'].default_value=3
  coord=nd.new('ShaderNodeTexCoord'); mapping=nd.new('ShaderNodeVectorMath'); mapping.operation='MULTIPLY'; mapping.inputs[1].default_value=scale
  lk.new(coord.outputs['Generated'],mapping.inputs[0]); lk.new(mapping.outputs[0],tex.inputs['Vector'])
  ramp=nd.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color=(*(x*.65 for x in col),1); ramp.color_ramp.elements[1].color=(*(min(1,x*1.22) for x in col),1)
  lk.new(tex.outputs['Fac'],ramp.inputs[0]); lk.new(ramp.outputs[0],p.inputs['Base Color'])
  bump=nd.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=noise; bump.inputs['Distance'].default_value=.035; lk.new(tex.outputs['Fac'],bump.inputs['Height']); lk.new(bump.outputs[0],p.inputs['Normal'])
 return m
oak=mat('Smoked oak | open grain',(.23,.135,.067),.48,noise=.25,scale=(2,35,4))
walnut=mat('Walnut | worn edges',(.115,.065,.035),.5,noise=.18,scale=(3,30,3))
plaster=mat('Warm limewash',(.61,.57,.46),.95,noise=.18,scale=(3,3,3))
green=mat('Oxidised sage paint',(.18,.25,.19),.65,noise=.12)
cream=mat('Ivory painted joinery',(.64,.61,.51),.52,noise=.06)
linen=mat('Flax linen | woven',(.61,.53,.39),.92,noise=.3,scale=(60,60,60))
white=mat('Washed cotton',(.77,.73,.62),.95,noise=.2,scale=(90,90,90))
blue=mat('Faded blue blanket',(.16,.25,.28),.95,noise=.25,scale=(65,65,65))
brass=mat('Aged brass',(.38,.26,.095),.3,.78,noise=.1)
iron=mat('Blackened iron',(.032,.038,.034),.35,.7)
ceramic=mat('Glazed stoneware',(.62,.58,.45),.23,noise=.07)
paper=mat('Aged book paper',(.62,.55,.39),.9,noise=.13)
black=mat('Old phone glass',(.012,.021,.022),.22,.2)
leather=mat('Chestnut leather',(.23,.085,.035),.7,noise=.2)
soil=mat('Garden earth',(.10,.12,.085),1,noise=.5)
leaf=mat('Olive leaves',(.12,.19,.08),.7)
terracotta=mat('Unglazed clay',(.35,.16,.09),.85,noise=.23)
def box(n,loc,size,m=oak,b=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=put(bpy.context.object,n,m); o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if b:
  mod=o.modifiers.new('Hand softened edges','BEVEL'); mod.width=b; mod.segments=3
  mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return o
def mesh(n,verts,faces,m):
 me=bpy.data.meshes.new(n); me.from_pydata(verts,[],faces); me.update(); o=bpy.data.objects.new(n,me); current.objects.link(o)
 if m: me.materials.append(m)
 for p in me.polygons:p.use_smooth=True
 return o
def lathe(n,x,y,z,profile,m,seg=64):
 vs=[]; fs=[]
 for r,h in profile:
  vs.extend([(x+r*cos(i*2*pi/seg),y+r*sin(i*2*pi/seg),z+h) for i in range(seg)])
 for j in range(len(profile)-1):
  for i in range(seg): a=j*seg+i; b=j*seg+(i+1)%seg; fs.append((a,b,b+seg,a+seg))
 return mesh(n,vs,fs,m)
def tube(n,pts,r,m,cyclic=False):
 cu=bpy.data.curves.new(n,'CURVE'); cu.dimensions='3D'; cu.bevel_depth=r; cu.bevel_resolution=3; cu.resolution_u=16
 sp=cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts)-1)
 for p,co in zip(sp.bezier_points,pts): p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 sp.use_cyclic_u=cyclic; o=bpy.data.objects.new(n,cu); current.objects.link(o); cu.materials.append(m); return o
def orb(n,loc,size,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=loc);o=put(bpy.context.object,n,m);o.scale=size
 for p in o.data.polygons:p.use_smooth=True
 return o
def text(n,body,loc,size,m=paper,rot=(pi/2,0,0)):
 cu=bpy.data.curves.new(n,'FONT');cu.body=body;cu.size=size;cu.extrude=.0003; o=bpy.data.objects.new(n,cu);current.objects.link(o);o.location=loc;o.rotation_euler=rot;cu.materials.append(m);return o
def cloth(n,cx,cy,z,w,d,m,amp=.025,drape=0):
 nx=48;ny=55;vs=[];fs=[]
 for j in range(ny+1):
  v=j/ny
  for i in range(nx+1):
   u=i/nx; edge=max(0,(abs(u-.5)*2-.73)/.27)
   h=z+amp*(sin(u*40+v*8)+.5*sin(v*49-u*9)+.3*cos(u*83+v*34))-drape*edge**1.5
   vs.append((cx+(u-.5)*w,cy+(v-.5)*d,h))
 for j in range(ny):
  for i in range(nx):a=j*(nx+1)+i;fs.append((a,a+1,a+nx+2,a+nx+1))
 o=mesh(n,vs,fs,m); so=o.modifiers.new('Hem thickness','SOLIDIFY');so.thickness=.008
 sub=o.modifiers.new('Fabric smoothing','SUBSURF');sub.levels=1; return o
def cushion(n,x,y,z,w,d,m):
 vs=[];fs=[];nu=48;nv=24
 for j in range(nv+1):
  v=j/nv*pi
  for i in range(nu):
   u=i/nu*2*pi; sx=cos(u);sy=sin(u)
   vs.append((x+w/2*math.copysign(abs(sx)**.4,sx)*sin(v)**.4,y+d/2*math.copysign(abs(sy)**.4,sy)*sin(v)**.4,z+.13*cos(v)+.008*sin(u*16)*sin(v)))
 for j in range(nv):
  for i in range(nu):a=j*nu+i;b=j*nu+(i+1)%nu;fs.append((a,b,b+nu,a+nu))
 mesh(n,vs,fs,m)
 pts=[(x+w/2*math.copysign(abs(cos(t))**.4,cos(t)),y+d/2*math.copysign(abs(sin(t))**.4,sin(t)),z) for t in [i/64*2*pi for i in range(64)]]
 tube(n+' | stitched piping',pts,.004,m,True)
def panel(n,x,y,z,w,h,m):
 box(n+' recessed field',(x,y+.013,z),(w-.08,.035,h-.08),m,.006)
 for dx in [-w/2+.025,w/2-.025]:box(n+' stile',(x+dx,y-.012,z),(.05,.065,h),m,.008)
 for dz in [-h/2+.025,h/2-.025]:box(n+' rail',(x,y-.012,z+dz),(w-.08,.065,.05),m,.008)
def leg(x,y,z,h,m=oak):
 lathe('Turned furniture leg',x,y,z,[(.025,0),(.035,.03),(.025,.08),(.033,h*.4),(.024,h*.7),(.048,h*.92),(.04,h)],m,32)
def table(n,x,y,w,d,h,m=oak):
 box(n+' beveled top',(x,y,h),(w,d,.065),m,.03)
 for a in [-1,1]:
  for b in [-1,1]:leg(x+a*(w/2-.1),y+b*(d/2-.1),0,h-.04,m)
 for b in [-1,1]:box(n+' apron',(x,y+b*(d/2-.12),h-.13),(w-.15,.05,.17),m)
def chair(x,y,rz=0):
 before=set(current.objects)
 box('Chair | shaped seat',(x,y,.48),(.46,.43,.065),oak,.06)
 for a in [-1,1]:
  for b in [-1,1]:leg(x+a*.17,y+b*.16,0,.46)
 for a in [-1,1]:tube('Chair | bowed uprights',[(x+a*.19,y+.16,.42),(x+a*.2,y+.20,.85),(x+a*.22,y+.13,1.02)],.022,oak)
 tube('Chair | curved crest',[(x-.23,y+.13,1.02),(x,y+.19,1.06),(x+.23,y+.13,1.02)],.035,oak)
 for a in [-.13,-.065,0,.065,.13]:tube('Chair | spindle',[(x+a,y+.18,.52),(x+a,y+.21,.79),(x+a,y+.17,1.02)],.009,oak)
 for o in set(current.objects)-before:
  p=Vector((x,y,0));bpy.context.view_layer.update()
  from mathutils import Matrix
  o.matrix_world=Matrix.Translation(p)@Matrix.Rotation(rz,4,'Z')@Matrix.Translation(-p)@o.matrix_world
def cup(x,y,z):
 lathe('Cup | hollow glazed ceramic',x,y,z,[(.001,0),(.052,0),(.062,.015),(.068,.10),(.065,.112),(.058,.11),(.055,.025),(.001,.025)],ceramic)
 tube('Cup | loop handle',[(x+.061,y,z+.09),(x+.103,y,z+.095),(x+.105,y,z+.04),(x+.062,y,z+.035)],.009,ceramic)
 lathe('Cold coffee',x,y,z,[(0,.055),(.056,.055)],walnut)
def book(x,y,z,w=.16,d=.23,h=.035,m=leather):
 box('Book | individual pages',(x,y,z+h/2),(w,d,h),paper,.002)
 for k in [0,h]:box('Book | cloth cover',(x,y,z+k),(w+.012,d+.012,.007),m,.002)
 box('Book | rounded spine',(x-w/2,y,z+h/2),(.014,d,h+.01),m,.005)
 for k in [.06,-.06]:box('Book | gold tooling',(x-w/2-.008,y+k,z+h/2),(.002,.008,h*.7),brass,.001)
def plant(x,y,z,s=.5):
 lathe('Terracotta pot',x,y,z,[(.001,0),(.10*s,0),(.15*s,.21*s),(.16*s,.23*s),(.14*s,.24*s),(.13*s,.21*s),(.001,.04*s)],terracotta)
 for i in range(8):
  a=i*2.4;end=(x+sin(a)*s*.3,y+cos(a)*s*.3,z+s*(.4+random.random()*.25))
  tube('Plant | stem',[(x,y,z+.15*s),end],.006*s,leaf)
  o=orb('Plant | leaf',end,(.12*s,.035*s,.008*s),leaf);o.rotation_euler=(.4,a,a)
def lamp(x,y,z):
 lathe('Lamp | turned brass base',x,y,z,[(0,0),(.14,0),(.14,.025),(.09,.045),(.035,.07),(.018,.34),(.04,.36)],brass)
 # pleats deliberately modelled into the shade
 vs=[];fs=[];seg=128
 for r,h in [(.23,.32),(.13,.61)]:
  for i in range(seg):a=i*2*pi/seg;rr=r+(.007 if i%2 else -.007);vs.append((x+rr*cos(a),y+rr*sin(a),z+h))
 for i in range(seg):j=(i+1)%seg;fs.append((i,j,j+seg,i+seg))
 mesh('Lamp | pleated linen shade',vs,fs,linen)
 for r,h in [(.23,.32),(.13,.61)]:tube('Shade | binding',[(x+r*cos(i*2*pi/64),y+r*sin(i*2*pi/64),z+h) for i in range(64)],.005,cream,True)
 light('Lamp glow',(x,y,z+.42),70,(1,.69,.36),'POINT',.2)
def light(n,loc,power,col,typ='AREA',size=3,target=None):
 data=bpy.data.lights.new(n,typ);data.energy=power;data.color=col
 if typ=='AREA':data.shape='DISK';data.size=size
 else:data.shadow_soft_size=size
 o=bpy.data.objects.new(n,data);collections['07 Lighting'].objects.link(o);o.location=loc
 if target:o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
 return o
def camera(n,loc,target,lens=26):
 data=bpy.data.cameras.new(n);o=bpy.data.objects.new(n,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();data.lens=lens;data.clip_start=.04;return o
# Architectural shell: every doorway is a true opening, not a painted door.
box('Foundation',(0,0,-.17),(11.4,12.4,.3),walnut)
for ix in range(44):
 x=-5.38+ix*.25
 for iy in range(6):
  y=-5+iy*2+(1 if ix%2 else 0)
  lo=max(-6,y-1);hi=min(6,y+1)
  if hi>lo:box('Oak floor | staggered plank',(x,(lo+hi)/2,-.018),(.246,hi-lo-.006,.045),oak,.004)
def wallx(x,y0,y1):
 box('Partition | plaster',(x,(y0+y1)/2,1.5),(.16,y1-y0,3),plaster)
 for z,ht in [(.10,.20),(2.88,.12)]:box('Partition | moulding',(x,(y0+y1)/2,z),(.21,y1-y0,ht),cream,.01)
def doorx(x,cy):
 box('Door | lintel',(x,cy,2.66),(.16,1.25,.68),plaster)
 for dy in [-.64,.64]:box('Door | profiled jamb',(x,cy+dy,1.15),(.24,.075,2.3),cream,.01)
 box('Door | architrave',(x,cy,2.32),(.24,1.38,.09),cream)
for x in [-1,1]:
 for a,b in [(-6,-4.15),(-2.85,2.0),(3.3,6)]:wallx(x,a,b)
 for y in [-3.5,2.65]:doorx(x,y)
# Horizontal partition left and right, rooms do not block central hall.
for x,w,y in [(-3.25,4.5,0),(3.25,4.5,1.4)]:
 box('Room division',(x,y,1.5),(w,.16,3),plaster)
 box('Skirting',(x,y,.1),(w,.22,.2),cream)
# Outer side walls, with tall recessed windows.
for x in [-5.55,5.55]:
 for a,b in [(-6,-4.55),(-2.45,2.0),(4.2,6)]:wallx(x,a,b)
 for y0,y1 in [(-4.55,-2.45),(2,4.2)]:
  cy=(y0+y1)/2
  box('Window | sill wall',(x,cy,.45),(.2,y1-y0,.9),plaster)
  box('Window | head wall',(x,cy,2.82),(.2,y1-y0,.36),plaster)
  for dy in [-(y1-y0)/2,0,(y1-y0)/2]:box('Window | mullion',(x,cy+dy,1.77),(.13,.055,1.74),cream)
  for z in [.9,1.77,2.64]:box('Window | transom',(x,cy,z),(.13,y1-y0,.055),cream)
  box('Window | deep oak sill',(x,cy,.91),(.42,y1-y0+.15,.065),oak)
  # linen curtains, folded surfaces rather than flat rectangles
  for side in [-1,1]:
   vs=[];fs=[]
   for j in range(41):
    v=j/40
    for i in range(25):
     u=i/24;vs.append((x+(-.18 if x>0 else .18)+.055*sin(u*8*pi),cy+side*((y1-y0)/2-.13)+(u-.5)*.43,2.7-v*2.42+.025*sin(u*20+v)))
   for j in range(40):
    for i in range(24):a=j*25+i;fs.append((a,a+1,a+26,a+25))
   mesh('Curtain | gathered linen',vs,fs,linen)
for y in [-6.1,6.1]:
 for x in [-3.2,3.2]:box('End wall',(x,y,1.5),(5,.2,3),plaster)
 box('Exterior door lintel',(0,y,2.7),(1.4,.2,.6),plaster)
 for x in [-.68,.68]:box('Exterior door casing',(x,y,1.2),(.1,.28,2.4),cream)
# Front closed door, back door open into porch
panel('Front door',0,-6.03,1.2,1.24,2.36,green)
for z in [.64,1.7]:panel('Front door inset',0,-6.08,z,1, .85,green)
orb('Front door knob',(.44,-5.94,1.08),(.045,.05,.045),brass)
current=collections['08 Ceiling']
box('Ceiling | removable for dollhouse',(0,0,3.12),(11.4,12.4,.18),cream)
for y in [-5.8,-3,0,3,5.8]:box('Ceiling | oak beam',(0,y,2.97),(11.2,.14,.20),oak)
current=collections['02 Entry']
table('Narrow console',.57,-5.2,.48,1.05,.78,walnut)
box('Console drawer',(.57,-5.2,.65),(.44,.82,.14),walnut)
lathe('Key dish',.55,-5.13,.82,[(0,0),(.10,0),(.13,.025),(.125,.03),(.07,.012),(0,.012)],ceramic)
for i in range(2):
 tube('Key | ring',[(.54+.026*cos(a),-5.13+.026*sin(a),.847+i*.008) for a in [j/32*2*pi for j in range(32)]],.003,brass,True)
 box('Key | shaft',(.58+i*.02,-5.1,.848),(.065,.008,.006),brass,.002)
 for k in range(3):box('Key | teeth',(.59+i*.02+k*.009,-5.09,.848),(.005,.014,.006),brass,.001)
box('Mirror | walnut frame',(.864,-4.88,1.64),(.08,.69,.96),walnut,.04)
mirror=mat('Tarnished silver mirror',(.5,.56,.51),.12,.98)
box('Mirror | silver',(.81,-4.88,1.64),(.012,.59,.86),mirror,.015)
box('Coat rail',(-.85,-5.1,1.9),(.08,1.2,.16),oak)
for y in [-5.55,-5.1,-4.65]:tube('Coat hook',[(-.78,y,1.93),(-.65,y,1.86),(-.61,y,1.96)],.012,brass)
tube('Old leash | hanging loop',[(-.64,-5.1,1.9),(-.62,-4.93,1.25),(-.64,-5.14,.69),(-.65,-5.29,1.18),(-.64,-5.1,1.9)],.017,leather)
for y in [-5.4,-5.12]:
 orb('Leather shoes | vamp',(-.57,y,.10),(.24,.105,.09),leather)
 box('Shoes | welted sole',(-.57,y,.036),(.43,.20,.04),walnut,.06)
 for i in range(5):tube('Shoelace',[(-.60+i*.025,y-.045,.18),(-.58+i*.025,y+.045,.18)],.002,linen)
cloth('Entry | woven runner',0,-4.2,.025,1.25,2.8,linen,.002)
current=collections['03 Kitchen']
# Shaker cabinetry against the southern wall
for x in [-4.9,-4.12,-3.34,-2.56,-1.78]:
 box('Cabinet | carcass',(x,-5.56,.43),(.76,.75,.84),green)
 panel('Cabinet | shaker door',x,-5.15,.45,.71,.72,green)
 orb('Cabinet | porcelain knob',(x+.22,-5.095,.67),(.024,.025,.024),ceramic)
box('Countertop | honed limestone',(-3.34,-5.54,.90),(3.95,.88,.075),ceramic,.018)
# Hollow sink above counter
box('Sink | basin bottom',(-4.12,-5.48,.949),(.56,.48,.03),ceramic)
for dx in [-.31,.31]:box('Sink | sides',(-4.12+dx,-5.48,1.025),(.05,.58,.16),ceramic,.025)
for dy in [-.27,.27]:box('Sink | sides',(-4.12,-5.48+dy,1.025),(.64,.05,.16),ceramic,.025)
tube('Faucet | swan neck',[(-4.12,-5.83,.95),(-4.12,-5.83,1.35),(-4.12,-5.6,1.39),(-4.12,-5.48,1.22)],.022,brass)
cup(-3.35,-5.37,.94);cup(-3.06,-5.5,.94)
for dx in [0,.23]:
 lathe('Coffee stain | dried ring',-3.35+dx,-5.37,.944,[(.074,0),(.077,0)],walnut)
lathe('Moka pot | faceted base',-2.45,-5.46,.94,[(0,0),(.09,0),(.10,.02),(.07,.13),(.07,.15),(.10,.16),(.08,.29),(0,.31)],iron,8)
tube('Moka pot | handle',[(-2.38,-5.46,1.20),(-2.27,-5.46,1.21),(-2.27,-5.46,1.10),(-2.36,-5.46,1.07)],.015,walnut)
orb('Moka pot | lid knob',(-2.45,-5.46,1.26),(.025,.025,.022),walnut)
box('Cutting board',(-1.83,-5.46,.956),(.40,.38,.025),oak,.045)
for z in [1.63,2.18]:
 box('Kitchen | open shelf',(-3.25,-5.84,z),(3.9,.32,.045),oak)
 for x in [-4.65,-1.85]:tube('Shelf bracket',[(x,-6,z-.3),(x,-5.7,z-.03),(x,-6,z-.03)],.012,iron)
 for i in range(7):
  x=-4.8+i*.48
  lathe('Shelf | lidded storage jar',x,-5.8,z+.03,[(0,0),(.09,0),(.10,.04),(.10,.23),(.075,.26),(.08,.29),(0,.29)],ceramic)
  lathe('Jar | wooden lid',x,-5.8,z+.32,[(0,0),(.083,0),(.083,.02),(0,.02)],oak)
table('Kitchen | farmhouse table',-3.1,-2.5,1.7,1.0,.77)
chair(-3.1,-1.7,pi);chair(-3.1,-3.3,0)
cloth('Linen | table runner',-3.1,-2.5,.814,.43,1.34,white,.004,.04)
lathe('Plate | glazed rim',-3.13,-2.5,.824,[(0,0),(.13,0),(.17,.02),(.18,.025),(.17,.032),(.13,.01),(0,.01)],ceramic)
plant(-3.7,-2.5,.81,.55)
box('Calendar | paper backing',(-1.3,-.105,1.6),(.43,.025,.60),paper)
text('Calendar | month','OCTOBER',(-1.48,-.123,1.8),.045,walnut)
for j in range(5):
 for i in range(7):text('Calendar | dates',str(1+j*7+i) if j*7+i<31 else '',(-1.48+i*.048,-.125,1.7-j*.07),.027,walnut)
tube('Calendar | circled date',[(-1.33+.034*cos(i*2*pi/40),-.13,1.56+.035*sin(i*2*pi/40)) for i in range(40)],.0025,leather,True)
current=collections['04 Bedroom']
box('Bed | carved walnut frame',(3.35,-3.58,.34),(1.9,2.35,.25),walnut,.06)
box('Bed | mattress',(3.35,-3.58,.57),(1.84,2.23,.29),white,.12)
for x in [2.43,4.27]:
 for y in [-4.72,-2.43]:lathe('Bed | turned post',x,y,0,[(.045,0),(.055,.08),(.045,.42),(.06,.48),(.04,.75),(.055,.79),(.025,.85)],walnut)
box('Bed | upholstered headboard',(3.35,-4.72,.91),(1.85,.12,.69),linen,.15)
for x in [2.75,3.05,3.35,3.65,3.95]:orb('Headboard | tuft button',(x,-4.642,.94),(.012,.009,.012),walnut)
cloth('Duvet | rumpled cotton',3.35,-3.35,.76,2.16,1.8,white,.045,.3)
cushion('Pillow | the untouched side',2.88,-4.25,.84,.73,.47,white)
cushion('Pillow | old hollow',3.83,-4.22,.82,.74,.48,white)
cloth('Throw | faded blue wool',3.35,-2.86,.82,2.22,.70,blue,.035,.33)
for i in range(38):
 x=2.35+i*.054;tube('Throw | knotted fringe',[(x,-2.51,.81),(x+.008,-2.46,.79),(x-.012,-2.42,.78)],.003,blue)
for x in [1.75,4.85]:
 table('Bedside | nightstand',x,-4.25,.52,.52,.62,walnut);lamp(x,-4.25,.66)
book(4.84,-3.99,.66,.14,.19,.03)
box('Alarm | rounded body',(1.75,-4.04,.74),(.21,.07,.12),iron,.025)
text('Alarm | two times','07:00', (1.66,-3.999,.75),.037,cream,(pi/2,0,pi))
# Wardrobe is open to reveal individually modelled hanging shirts
box('Wardrobe | back',(4.5,-.3,1.17),(1.58,.09,2.34),walnut)
for x in [3.72,5.28]:box('Wardrobe | side',(x,-.63,1.17),(.07,.72,2.34),walnut)
for z in [.10,2.32]:box('Wardrobe | cornice',(4.5,-.63,z),(1.72,.83,.12),walnut,.025)
tube('Wardrobe | rail',[(3.78,-.65,1.99),(5.2,-.65,1.99)],.018,brass)
for i in range(6):
 x=3.94+i*.22
 tube('Hanger | bent wood',[(x,-.65,1.96),(x-.10,-.65,1.79),(x+.10,-.65,1.79),(x,-.65,1.96)],.009,oak,True)
 # shirt as a shaped, draped quad surface, with shoulders and sleeves
 vs=[];fs=[]
 for j in range(31):
  v=j/30
  for k in range(25):
   u=k/24; width=.18+.12*math.exp(-((v-.12)/.15)**2)
   vs.append((x+(u-.5)*width,-.65+.09*sin(u*pi*2)+.014*sin(v*24+u*13),1.8-v*.69+.015*sin(u*19)))
 for j in range(30):
  for k in range(24):a=j*25+k;fs.append((a,a+1,a+26,a+25))
 mesh('Wardrobe | hanging shirt with folds',vs,fs,[white,blue,linen][i%3])
for z in [.2,.28,.36]:cloth('Wardrobe | folded linen',4.5,-.65,z,.63,.43,linen,.006)
cloth('Bedroom | woven rug',3.35,-2.0,.024,3.2,4.9,linen,.002)
current=collections['05 Study']
table('Writing desk',-3.55,4.7,2.5,.88,.78,walnut)
chair(-3.55,3.85,pi)
lamp(-4.45,4.8,.82)
for i in range(7):
 o=box('Unfinished letters',(-3.6+random.uniform(-.06,.06),4.6+random.uniform(-.06,.06),.825+i*.003),(.35,.28,.002),paper,.001);o.rotation_euler.z=random.uniform(-.2,.2)
for i in range(8):box('Letter | handwritten line',(-3.6,4.51+i*.023,.85),(.22-random.random()*.09,.002,.001),walnut,.0001)
book(-2.75,4.72,.82,.28,.34,.05)
tube('Pen | fountain pen',[(-3.37,4.49,.86),(-3.18,4.61,.86)],.006,iron)
box('Phone | worn frame',(-3.98,4.5,.85),(.084,.16,.014),iron,.012)
box('Phone | dark screen',(-3.98,4.5,.859),(.073,.135,.002),black,.008)
text('Phone | unsent draft','I will',(-4.01,4.49,.861),.012,cream,(0,0,0))
for x in [-5.05,-1.65]:
 box('Bookcase | back',(x,1.0,1.21),(.7,.08,2.4),walnut)
 for dx in [-.36,.36]:box('Bookcase | stile',(x+dx,.76,1.21),(.065,.59,2.4),walnut)
 for z in [.08,.57,1.06,1.55,2.04,2.43]:
  box('Bookcase | shelf',(x,.76,z),(.78,.6,.05),walnut)
  if z<2.1:
   for i in range(8):
    h=random.uniform(.24,.37);m=mat('Book | faded binding',random.choice([(.23,.13,.075),(.12,.18,.16),(.32,.29,.19)]),.8)
    box('Book | bound volume',(x-.28+i*.08,.70,z+h/2+.028),(.065,.26,h),m,.008)
    for zz in [-h*.35,h*.35]:box('Book | gold spine rule',(x-.28+i*.08,.563,z+h/2+.028+zz),(.05,.003,.006),brass,.001)
# unfinished wooden architectural model on a work table
table('Workshop | second bench',-4.8,2.8,.8,1.4,.77)
box('Unfinished promise | model base',(-4.8,2.8,.83),(.62,.9,.04),oak)
for y in [2.55,3.05]:
 for x in [-4.99,-4.61]:tube('Model | frame',[(x,y,.85),(x,y,1.14),(-4.8,y,1.30)],.012,oak)
tube('Model | unfinished ridge',[(-4.8,2.55,1.30),(-4.8,3.05,1.30)],.012,oak)
for i in range(5):box('Workshop | loose timber',(-4.85+i*.07,2.78,.87),(.025,.30,.025),oak,.002)
plant(-2,5.4,0,1.2)
current=collections['06 Back porch']
box('Porch | floor',(0,7.1,-.07),(4.4,2,.14),oak)
for x in [-2.1,2.1]:
 box('Porch | post',(x,7.85,1.5),(.12,.12,3),cream)
 box('Porch | railing',(x,7.1,.8),(.06,1.6,.09),cream)
 for i in range(10):box('Porch | baluster',(x,6.35+i*.16,.45),(.04,.04,.65),cream,.006)
box('Back door | open leaf',(.80,6.62,1.16),(.08,1.23,2.32),green)
for z in [.6,1.7]:box('Back door | recessed panel',(.75,6.62,z),(.018,1.03,.88),green)
orb('Back door | brass handle',(.69,7.12,1.04),(.045,.04,.04),brass)
lathe('Water bowl | worn hollow ceramic',-.72,6.8,0,[(0,.008),(.16,.008),(.2,.085),(.195,.10),(.18,.09),(.145,.025),(0,.025)],ceramic)
water=mat('Still water',(.18,.24,.23),.10,.3)
lathe('Water bowl | still water',-.72,6.8,0,[(0,.05),(.16,.05)],water)
tube('Porch | faint circular worn patch',[(-.65+.42*cos(i*2*pi/100),7.4+.40*sin(i*2*pi/100),.008) for i in range(100)],.015,walnut,True)
plant(1.5,7.4,0,1)
current=collections['01 Architecture']
box('Garden | surrounding earth',(0,0,-.28),(70,70,.15),soil)
for i in range(65):
 x=random.uniform(-20,20);y=random.uniform(-20,20)
 if abs(x)<7 and abs(y)<10:continue
 h=random.uniform(3,7)
 lathe('Garden | tree trunk',x,y,-.2,[(.16,0),(.12,h*.65),(.045,h)],walnut,12)
 for j in range(3):orb('Garden | soft foliage',(x+random.uniform(-.5,.5),y+random.uniform(-.5,.5),h-j*.5),(1.2,1.3,1.4),leaf)
# Lighting: warm grazing window light balanced by cold ambient light.
scene.world=bpy.data.worlds.new('Late afternoon | cool ambient');scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.32,.40,.47,1);bg.inputs[1].default_value=.35
for x in [-5.9,5.9]:
 for y in [-3.5,3.1]:light('Window | soft afternoon',(x,y,2.2),380,(1,.83,.61),'AREA',2.2,(0,y,1))
for x,y in [(-3,-3),(3,-3),(-3,3),(3,3),(0,0)]:light('Bounce | diffuse ceiling',(x,y,2.8),120,(1,.89,.72),'AREA',3,(x,y,0))
sun=light('Sun | late afternoon',(-8,-10,9),2.3,(1,.76,.48),'SUN',.1,(0,0,0));sun.data.angle=.08
cams={
 '01 Kitchen':camera('01 Kitchen',(-1.38,-.7,1.65),(-3.4,-4.7,1.05),23),
 '02 Bedroom':camera('02 Bedroom',(1.45,.8,1.65),(3.4,-3.4,.85),23),
 '03 Study':camera('03 Study',(-1.4,1.4,1.65),(-3.5,4.5,1.05),24),
 '04 Hall':camera('04 Hall',(0,-5.65,1.64),(0,6,1.5),22),
 '05 Porch':camera('05 Porch',(-1.5,7.7,1.65),(.1,6.3,.7),25),
 '06 Dollhouse':camera('06 Dollhouse',(15,-19,19),(0,0,0),42)}
scene.camera=cams['01 Kitchen']
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG'
# A comfortable first-person viewport start, ready for Shift+` Walk Navigation.
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':
   a.spaces.active.clip_start=.04;a.spaces.active.clip_end=200
   reg=a.spaces.active.region_3d;reg.view_perspective='PERSP';reg.view_distance=.1;reg.view_location=(0,-5.45,1.65)
scene['Walk instructions']='Camera height 1.65m. Shift+` in viewport for Blender Walk. WASD + mouse. Central hall clear width 1.84m, doors 1.22m.'
scene['Design']='DogYears | No dog is ever represented. Five connected grief spaces, one afternoon.'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_House.blend'))
print('BUILT',len(scene.objects),'objects. Saved',bpy.data.filepath)
