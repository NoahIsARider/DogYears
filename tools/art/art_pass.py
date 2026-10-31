import bpy,os,math,json,random,contextlib,io
import numpy as np
from mathutils import Vector,Matrix
from math import pi,sin,cos
def _repo_root(start):
    p=os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(p,'package.json')) and os.path.dirname(p)!=p:
        p=os.path.dirname(p)
    return p

ROOT=_repo_root(__file__);OUT=os.path.join(ROOT,'deliverables');ASSETS=os.path.join(ROOT,'reference','assets');scene=bpy.context.scene
random.seed(49)
art=bpy.data.collections.new('10 Art direction | Poly Haven CC0');scene.collection.children.link(art)
def bounds(obs):
 pts=[o.matrix_world@Vector(c) for o in obs if o.type=='MESH' for c in o.bound_box]
 return Vector(tuple(min(p[k] for p in pts) for k in range(3))),Vector(tuple(max(p[k] for p in pts) for k in range(3)))
def remove(prefixes,condition=None):
 for o in list(scene.objects):
  if o.name.startswith(tuple(prefixes)) and (condition is None or condition(o)):bpy.data.objects.remove(o,do_unlink=True)
def center(o):return sum((o.matrix_world@Vector(c) for c in o.bound_box),Vector())/8
templates={}
def imported(id):
 before=set(scene.objects)
 with contextlib.redirect_stdout(io.StringIO()):bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS,id,id+'.gltf'))
 obs=list(set(scene.objects)-before);meshes=[]
 for o in obs:
  if o.type=='MESH':
   wm=o.matrix_world.copy();o.parent=None;o.matrix_world=wm
   for mod in list(o.modifiers):
    if mod.type=='ARMATURE':o.modifiers.remove(mod)
   for c in list(o.users_collection):c.objects.unlink(o)
   art.objects.link(o);meshes.append(o)
 for o in obs:
  if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
 # The dining model includes an optional cloth; retain our story-specific runner.
 if id=='dining_table':
  for o in list(meshes):
   if 'cloth' in o.name.lower():meshes.remove(o);bpy.data.objects.remove(o,do_unlink=True)
 for o in meshes:
  for p in o.data.polygons:p.use_smooth=True
 templates[id]=meshes
 return meshes
def place(id,name,loc,dims=None,height=None,angle=0,only_first=False,template=None):
 if template is None:
  if id not in templates:obs=imported(id)
  else:
   obs=[]
   for src in templates[id]:
    o=src.copy();o.data=src.data;art.objects.link(o);obs.append(o)
 else:obs=template
 if only_first and len(obs)>1:
  keep=obs[0]
  for o in obs[1:]:bpy.data.objects.remove(o,do_unlink=True)
  obs=[keep]
 bpy.context.view_layer.update();lo,hi=bounds(obs);size=hi-lo
 scale=Vector(tuple(dims[k]/size[k] for k in range(3))) if dims else Vector((height/size.z,)*3)
 pivot=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 T=Matrix.Translation(loc)@Matrix.Rotation(angle,4,'Z')@Matrix.Diagonal((*scale,1))@Matrix.Translation(-pivot)
 for i,o in enumerate(obs):o.matrix_world=T@o.matrix_world;o.name=name+(' | '+str(i) if len(obs)>1 else '')
 bpy.context.view_layer.update();print('PLACED',id,name,tuple(round(v,3) for v in bounds(obs)[1]-bounds(obs)[0]))
 return obs
# Real, individually textured furniture replaces the conspicuous procedural placeholders.
remove(['DY_Chair_'])
for i,(x,y,a) in enumerate([(-3.1,-1.66,.05),(-3.35,-3.42,pi-.16),(-3.55,3.73,pi+.08)]):place('painted_wooden_chair_01','Art | worn chair '+str(i),(x,y,0),height=1.0,angle=a)
remove(['Kitchen | farmhouse table'])
remove(['Turned furniture leg'],lambda o: (center(o).x<-2 and -3.05<center(o).y<-1.95 and .68<o.dimensions.z<.76))
place('dining_table','Art | family dining table',(-3.1,-2.5,0),dims=(1.76,1.03,.8025))
# Hand-built bedside props keep their narrative position, on properly modelled worn side tables.
remove(['Bedside | nightstand'])
remove(['Turned furniture leg'],lambda o: .55<o.dimensions.z<.62 and (center(o)-Vector((1.75,-4.25,.29))).length<.65 or .55<o.dimensions.z<.62 and (center(o)-Vector((4.85,-4.25,.29))).length<.65)
for x in [1.75,4.85]:place('side_table_01','Art | bedside chest',(x,-4.25,0),dims=(.53,.52,.65))
remove(['Settee |','Turned furniture leg'],lambda o: 2<center(o).x<4.4 and 2.5<center(o).y<3.95 and center(o).z<1.35)
place('sofa_03','Art | faded reading sofa',(3.2,3.25,0),dims=(2.10,1.10,1.05))
# The old hutch gives the kitchen a second inhabited wall, leaving every doorway clear.
place('vintage_cabinet_01','Art | inherited kitchen hutch',(-3.88,-.46,0),dims=(1.92,.58,2.12))
# A real articulated lamp on the work desk; remove just that old placeholder lamp.
remove(['Lamp |','Shade |'],lambda o:(center(o)-Vector((-4.45,4.8,1.10))).length<.65)
place('desk_lamp_arm_01','Art | articulated desk lamp',(-4.45,4.8,.82),height=.49,angle=.25)
place('book_encyclopedia_set_01','Art | worn encyclopedias',(-2.67,4.78,.82),dims=(.41,.14,.21),angle=.08)
place('book_encyclopedia_set_01','Art | books in reading nook',(3.19,4.71,.49),dims=(.39,.14,.20),angle=-.10)
# Clear the artificial spear-leaf plants and bring in artist-authored foliage.
remove(['Terracotta pot','Plant |'])
place('potted_plant_04','Art | kitchen plant',(-3.70,-2.5,.815),height=.29)
place('potted_plant_04','Art | porch plant',(1.5,7.4,0),height=.38,angle=.4)
for i,(x,y,sc) in enumerate([(-6.45,-4.1,1.25),(-6.55,-2.8,1.0),(-6.45,3.1,1.3),(6.5,-3.9,1.2),(6.6,3.2,1.2),(-2.7,8.8,1.0),(2.9,9.2,1.2)]):place('fern_02','Art | fern border '+str(i),(x,y,-.17),dims=(sc,sc*.85,sc*.29),angle=i*1.9)
remove(['Study | small portrait'])
place('standing_picture_frame_01','Art | desk photograph',(-4.03,4.89,.82),height=.25,angle=-.13)
place('standing_picture_frame_01','Art | bedside photograph',(4.85,-4.37,.66),height=.19,angle=.18)
remove(['Moka pot |'])
place('vintage_electric_kettle','Art | old enamel kettle',(-2.5,-5.5,.945),height=.25,angle=.15)
remove(['Alarm |'])
place('alarm_clock_01','Alarm | old clock',(1.75,-4.02,.66),dims=(.21,.085,.15),angle=pi)
# Real pillow meshes retain the exact interactive names and story anchor positions.
remove(['Pillow |'])
obs=imported('throw_pillows_01')
obs.sort(key=lambda o:o.name)
for i,o in enumerate(obs):
 place('throw_pillows_01',['Pillow | the untouched side','Pillow | old hollow'][i%2],[(2.88,-4.25,.735),(3.83,-4.22,.725)][i%2],dims=(.73,.47,.19),angle=[-.04,.07][i%2],template=[o])
# Measured scanned PBR textures replace the synthetic noise maps on large surfaces.
def scanned(id,name,normal_strength=.35,tone=None):
 files=json.load(open(os.path.join(ASSETS,id,'texture-map.json')));m=bpy.data.materials.new(name);m.use_nodes=True;nd=m.node_tree.nodes;nd.clear();lk=m.node_tree.links;p=nd.new('ShaderNodeBsdfPrincipled');out=nd.new('ShaderNodeOutputMaterial');lk.new(p.outputs[0],out.inputs[0]);p.inputs['Roughness'].default_value=.75
 for key,socket in [('Diffuse','Base Color'),('Rough','Roughness')]:
  if key not in files:continue
  im=bpy.data.images.load(os.path.join(ROOT,files[key]),check_existing=True)
  if key=='Diffuse' and tone:
   w,h=im.size;arr=np.empty(w*h*4,np.float32);im.pixels.foreach_get(arr);arr=arr.reshape(h,w,4);lum=arr[:,:,:3]@np.array([.2126,.7152,.0722],np.float32)
   if tone=='floor':rgb=(arr[:,:,:3]*.65+lum[:,:,None]*.35)*np.array([.88,.91,.93])
   else:
    target=np.array(tone);rgb=lum[:,:,None]/max(.01,float(lum.mean()))*target[None,None,:]
   arr[:,:,:3]=np.clip(rgb,0,1);graded=bpy.data.images.new(name+' | graded scan',width=w,height=h,alpha=True);graded.pixels.foreach_set(arr.ravel());im=graded
  if key!='Diffuse':im.colorspace_settings.name='Non-Color'
  im.pack();tex=nd.new('ShaderNodeTexImage');tex.image=im;lk.new(tex.outputs['Color'],p.inputs[socket])
 if 'nor_gl' in files:
  im=bpy.data.images.load(os.path.join(ROOT,files['nor_gl']),check_existing=True);im.colorspace_settings.name='Non-Color';im.pack();tex=nd.new('ShaderNodeTexImage');tex.image=im;n=nd.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=normal_strength;lk.new(tex.outputs['Color'],n.inputs['Color']);lk.new(n.outputs[0],p.inputs['Normal'])
 return m
floor=scanned('old_wooden_floor_02','Art | scanned worn oak floor',.34,'floor')
wall=scanned('grey_plaster_03','Art | scanned aged lime plaster',.23)
linen=scanned('rough_linen','Art | scanned washed ivory linen',.18,(.62,.60,.54))
blue=scanned('rough_linen','Art | scanned faded blue linen',.20,(.22,.285,.30))
soil=scanned('forest_floor','Art | scanned forest litter',.45)
paint=scanned('weathered_peeling_timber','Art | scanned old window paint',.22)
def assign(o,m,scale=1,axes=None):
 o.data.materials.clear();o.data.materials.append(m)
 if o.type!='MESH':return
 uv=o.data.uv_layers.active or o.data.uv_layers.new(name='UVMap')
 for poly in o.data.polygons:
  if axes:aa=axes
  else:
   n=o.matrix_world.to_3x3()@poly.normal;axis=max(range(3),key=lambda k:abs(n[k]));aa=[k for k in range(3) if k!=axis]
  for li in poly.loop_indices:
   co=o.matrix_world@o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(co[aa[0]]/scale,co[aa[1]]/scale)
for o in list(scene.objects):
 if o.type!='MESH':continue
 n=o.name
 if n.startswith('Oak floor |'):assign(o,floor,8,axes=(1,0))
 elif n.startswith(('Partition | plaster','Room division','End wall','Window | sill wall','Window | head wall','Door | lintel','Exterior door lintel')):assign(o,wall,3.5)
 elif n.startswith(('Duvet |','Pillow |','Linen | table runner','Wardrobe | folded linen','Tea towel')):assign(o,linen,1.45)
 elif n.startswith('Throw | folded'):assign(o,blue,1.45)
 elif n.startswith(('Garden | surrounding','Landscape | ridge 1')):assign(o,soil,4.8,axes=(0,1))
 elif n.startswith(('Old blind |','Window | mullion','Window | transom')):assign(o,paint,1.2)
# Pack the real artist-authored image maps so the .blend is self contained.
for im in bpy.data.images:
 if im.source=='FILE' and im.has_data:
  try:im.pack()
  except:pass
# Environment for material review; the game controls its own moving sun and IBL.
world=scene.world;world.use_nodes=True;nd=world.node_tree.nodes;lk=world.node_tree.links;bg=next(n for n in nd if n.type=='BACKGROUND')
env=nd.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(os.path.join(ROOT,'public','environment','house_afternoon.hdr'),check_existing=True);env.image.pack();lk.new(env.outputs['Color'],bg.inputs['Color']);bg.inputs['Strength'].default_value=.18
scene.view_settings.exposure=.05
scene.render.resolution_percentage=75;scene.cycles.samples=32
scene['Third party art']='Poly Haven CC0; see reference/assets/manifest.json for original artists and sources.'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_ArtPass.blend'))
for cam,f in [('01 Kitchen','art_kitchen_review1.png'),('02 Bedroom','art_bedroom_review1.png'),('07 Garden','art_garden_review1.png')]:
 scene.camera=bpy.data.objects[cam];scene.render.filepath=os.path.join(OUT,f);bpy.ops.render.render(write_still=True)
print('ART PASS REVIEW READY',len(scene.objects),'objects')
