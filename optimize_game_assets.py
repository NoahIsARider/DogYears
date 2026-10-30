import bpy,os,contextlib,io
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
curves=0;cloths=0
for o in s.objects:
 if o.type=='CURVE':
  cu=o.data
  if cu.bevel_depth<.011 or sum(len(sp.bezier_points)+len(sp.points) for sp in cu.splines)>30:
   cu.resolution_u=3;cu.bevel_resolution=1
  else:cu.resolution_u=8;cu.bevel_resolution=2
  curves+=1
 if o.type=='MESH' and any(o.name.startswith(p) for p in ['Bedroom | woven rug','Entry | woven runner','Linen | table runner','Tea towel','Wardrobe | folded linen']):
  for mod in list(o.modifiers):
   if mod.type=='SUBSURF':o.modifiers.remove(mod)
  dec=o.modifiers.new('Efficient cloth surface','DECIMATE');dec.ratio=.24 if 'rug' in o.name or 'runner' in o.name else .45
  cloths+=1
s.camera=bpy.data.objects['01 Kitchen']
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_Game.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
buf=io.StringIO()
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public','models','DogYears_Game.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
print('OPTIMIZED',curves,'curves and',cloths,'cloth surfaces;',os.path.getsize(os.path.join(ROOT,'public','models','DogYears_Game.glb')),'bytes')
