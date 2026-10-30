import bpy,os,contextlib,io
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
for o in s.objects:
 if o.type!='MESH' or not o.name.startswith(('Natural foliage','Natural bark')):continue
 for p in o.data.polygons:p.use_smooth=True
 mod=o.modifiers.new('Leaf silhouette efficiency','DECIMATE');mod.ratio=.55 if o.name.startswith('Natural foliage') else .70
s.camera=bpy.data.objects['01 Kitchen']
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_Game.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
buf=io.StringIO();final=os.path.join(ROOT,'public','models','DogYears_Game_Final.glb')
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=final,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
print('READY',final,os.path.getsize(final),'bytes')
