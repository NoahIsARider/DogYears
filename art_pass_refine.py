import bpy,os,math,json,random,contextlib,io
import numpy as np
from mathutils import Vector,Matrix
from math import pi,sin,cos
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables');ASSETS=os.path.join(ROOT,'reference','assets');scene=bpy.context.scene
art=bpy.data.collections['10 Art direction | Poly Haven CC0'];random.seed(7149)
source=open(os.path.join(ROOT,'art_pass.py'),encoding='utf-8').read()
exec(source[source.index('def bounds'):source.index('# Real, individually')])
exec(source[source.index('def scanned'):source.index('floor=scanned')])
exec(source[source.index('def assign'):source.index('for o in list(scene.objects):',source.index('def assign'))])
def calm(m,target,contrast=.55):
 p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');tex=p.inputs['Base Color'].links[0].from_node;im=tex.image;w,h=im.size;a=np.empty(w*h*4,np.float32);im.pixels.foreach_get(a);a=a.reshape(h,w,4);mean=a[:,:,:3].mean(axis=(0,1));tar=np.array(target,np.float32)
 a[:,:,:3]=np.clip(tar[None,None,:]+(a[:,:,:3]/np.maximum(mean,1e-4)[None,None,:]*tar[None,None,:]-tar[None,None,:])*contrast,0,1)
 new=bpy.data.images.new(m.name+' | restrained grade',width=w,height=h,alpha=True);new.pixels.foreach_set(a.ravel());new.pack();tex.image=new
wood=scanned('wood_table_worn','Art | scanned furniture walnut',.24)
calm(wood,(.17,.115,.075),.8)
oak=scanned('white_oak_veneer','Art | scanned old oak joinery',.20)
calm(oak,(.24,.19,.135),.65)
green=scanned('white_oak_veneer','Art | grain beneath sage paint',.15)
calm(green,(.25,.295,.25),.22)
bark=scanned('jolcham_oak_bark_01','Art | scanned oak bark',.6)
wall=bpy.data.materials['Art | scanned aged lime plaster'];calm(wall,(.47,.455,.405),.46)
for n in wall.node_tree.nodes:
 if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=.12
linen=bpy.data.materials['Art | scanned washed ivory linen'];blue=bpy.data.materials['Art | scanned faded blue linen']
for o in list(scene.objects):
 if o.type!='MESH':continue
 names=[m.name for m in o.data.materials if m]
 if any(n.startswith('Natural bark') for n in names):assign(o,bark,1.6)
 elif any(n.startswith('Walnut |') for n in names):assign(o,wood,1.25)
 elif any(n.startswith('Smoked oak |') for n in names):assign(o,oak,1.25)
 elif any(n.startswith('Oxidised sage') for n in names):assign(o,green,1.4)
 elif o.name.startswith('Wardrobe | hanging shirt'):assign(o,linen if '001' not in o.name else blue,1.45)
# The first pillow import was an upright throw pillow; use those correctly in the reading nook.
for i,o in enumerate([o for o in scene.objects if o.name.startswith('Pillow |')]):
 wm=o.matrix_world.copy();o.data=o.data.copy();o.data.transform(wm);o.matrix_world=Matrix.Identity(4)
 lo,hi=bounds([o]);size=hi-lo;target=Vector((.40,.24,.40));pivot=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 T=Matrix.Translation((2.68+i*.75,3.55,.50))@Matrix.Diagonal((*(target[k]/size[k] for k in range(3)),1))@Matrix.Translation(-pivot)
 o.data.transform(T);o.name='Art | linen throw cushion '+str(i);assign(o,blue,1.45)
# Restore the carefully fitted, weighted bed pillows with the new real woven fabric maps.
with bpy.data.libraries.load(os.path.join(OUT,'DogYears_Game.blend'),link=False) as (data_from,data_to):data_to.objects=[n for n in data_from.objects if n.startswith('Pillow |')]
for o in data_to.objects:
 if o:
  art.objects.link(o)
  if o.type=='MESH':assign(o,linen,1.45)
  elif hasattr(o.data,'materials'):o.data.materials.clear();o.data.materials.append(linen)
# A real artist-authored broadleaf tree provides the near and mid distance foliage.
remove(['Natural foliage |','Natural bark |'])
obs=imported('tree_small_02');tree=obs[0]
bpy.ops.object.select_all(action='DESELECT');tree.select_set(True);bpy.context.view_layer.objects.active=tree
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='MATERIAL');bpy.ops.object.mode_set(mode='OBJECT')
parts=[o for o in bpy.context.selected_objects if o.type=='MESH']
for o in parts:
 name=o.data.materials[0].name.lower();ratio=.012 if 'leaves' in name else (.10 if 'branches' in name else .20)
 bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Artist tree runtime LOD','DECIMATE');mod.ratio=ratio;bpy.ops.object.modifier_apply(modifier=mod.name)
 for p in o.data.polygons:p.use_smooth=True
high=parts;low=[]
for src in high:
 o=src.copy();o.data=src.data.copy();art.objects.link(o);low.append(o);bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Distant leaf LOD','DECIMATE');mod.ratio=.30;bpy.ops.object.modifier_apply(modifier=mod.name)
# Copy the unplaced reduced prototypes, then place the originals last.
def treecopy(proto,name,loc,height,angle):
 copies=[]
 for src in proto:o=src.copy();o.data=src.data;art.objects.link(o);copies.append(o)
 return place('tree_small_02',name,loc,height=height,angle=angle,template=copies)
for i,(x,y) in enumerate([(-8,-3.5),(-8.8,3.5),(8.4,-3.5),(8.8,3.5)]):treecopy(high,'Art | yard tree '+str(i),(x,y,-.2),5.3+i*.17,i*1.7)
for i,(x,y) in enumerate([(-4.4,15),(4.7,16)]):treecopy(low,'Art | garden tree '+str(i),(x,y,-.2),5.9+i*.3,i*2.1)
def groundz(a,b):
 old=[4.6,10.4,17.8][b]+[1.4,2.7,4.1][b]*(.6*sin(a*3+b*.8)+.27*sin(a*7+1.4)+.13*sin(a*13+.7))
 return old*[.28,.45,.44][b]+[-.2,0,.25][b]
for i in range(20):
 a=i/20*2*pi+.08*sin(i*2.3);r=29+5*sin(i*1.7)
 treecopy(low,'Art | distant woodland '+str(i),(r*cos(a),r*sin(a),groundz(a,0)-.3),5.1+random.random()*2.5,i*2.399)
for o in high+low:bpy.data.objects.remove(o,do_unlink=True)
# Review the art through the same human-height cameras before exporting.
scene.render.resolution_percentage=75;scene.cycles.samples=32
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_ArtPass.blend'))
for cam,f in [('01 Kitchen','art_kitchen_review2.png'),('02 Bedroom','art_bedroom_review2.png'),('03 Study','art_study_review2.png'),('07 Garden','art_garden_review2.png')]:
 scene.camera=bpy.data.objects[cam];scene.render.filepath=os.path.join(OUT,f);bpy.ops.render.render(write_still=True)
print('SECOND ART REVIEW COMPLETE',len(scene.objects),'objects')
