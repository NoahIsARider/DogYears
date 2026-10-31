import bpy,os,math,contextlib,io
from mathutils import Vector,Matrix
def _repo_root(start):
    p=os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(p,'package.json')) and os.path.dirname(p)!=p:
        p=os.path.dirname(p)
    return p

ROOT=_repo_root(__file__);OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
# The first review exposed an inherited backwards-facing bedroom picture.
for o in s.objects:
 if o.name.startswith('Bedroom | empty landscape'):
  o.matrix_world=Matrix.Translation((0,-5.975,0))@Matrix.Diagonal((1,-1,1,1))@Matrix.Translation((0,5.975,0))@o.matrix_world
# Gentle fill is retained in shadow, so a worn home does not read as a horror set.
for o in s.objects:
 if o.type!='LIGHT':continue
 if o.name.startswith('Window'):o.data.energy=190
 elif o.name.startswith('Bounce'):o.data.energy=64
s.view_settings.exposure=.30
# Low distant folds of terrain close the flat horizon without restricting the garden path.
collection=bpy.data.collections.get('01 Architecture');vs=[];fs=[];nx=80;ny=72
for j in range(ny+1):
 y=-45+j*1.6
 for i in range(nx+1):
  x=-64+i*1.6;d=max(abs(x)/15,abs(y)/20)
  weight=min(1,max(0,(d-1)/1.5))
  z=-.32+weight*(2.5+1.6*math.sin(x*.055+y*.035)+1.2*math.cos(y*.075-x*.025))
  vs.append((x,y,z))
for j in range(ny):
 for i in range(nx):a=j*(nx+1)+i;fs.append((a,a+1,a+nx+2,a+nx+1))
me=bpy.data.meshes.new('Garden | distant hills mesh');me.from_pydata(vs,[],fs);me.update()
o=bpy.data.objects.new('Garden | distant soft hills',me);collection.objects.link(o)
me.materials.append(bpy.data.materials.get('Garden | dry moss and soil') or bpy.data.materials['Garden earth'])
for p in me.polygons:p.use_smooth=True
# Diagnostic render: finish and evaluate the actual final bedding and garden view.
s.render.resolution_percentage=70;s.cycles.samples=32
for n,f in [('01 Kitchen','game_kitchen_final.png'),('02 Bedroom','game_bedroom_final.png')]:
 s.camera=bpy.data.objects[n];s.render.filepath=os.path.join(OUT,f);bpy.ops.render.render(write_still=True)
data=bpy.data.cameras.new('07 Garden');cam=bpy.data.objects.new('07 Garden',data);s.collection.objects.link(cam);cam.location=(0,7.7,1.65);cam.rotation_euler=(Vector((0,12.5,1.2))-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=28
s.camera=cam;s.render.filepath=os.path.join(OUT,'game_garden_final.png');bpy.ops.render.render(write_still=True)
s.camera=bpy.data.objects['01 Kitchen']
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_Game.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
buf=io.StringIO()
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','models','DogYears_Game.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
print('FINAL ASSET',len(s.objects),'objects;',os.path.getsize(os.path.join(ROOT,'public','models','DogYears_Game.glb')),'bytes')
