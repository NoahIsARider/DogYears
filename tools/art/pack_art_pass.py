import bpy,os,contextlib,io,json
from mathutils import Vector
def _repo_root(start):
    p=os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(p,'package.json')) and os.path.dirname(p)!=p:
        p=os.path.dirname(p)
    return p

ROOT=_repo_root(__file__);OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
for o in s.objects:
 if o.name.startswith('Wardrobe | hanging shirt | layered linen'):o.name=o.name.replace('Wardrobe | hanging shirt | layered linen','Wardrobe | background garment | muted linen')
# Reuse the main graded oak on the tiny hanger rather than embedding a duplicate full texture.
oaks=[m for m in bpy.data.materials if m.name.startswith('Art | scanned old oak joinery')]
oak=max(oaks,key=lambda m:m.users)
for o in s.objects:
 if 'wooden hanger' in o.name and o.type=='CURVE':o.data.materials.clear();o.data.materials.append(oak)
materials={m for o in s.objects if hasattr(o.data,'materials') for m in o.data.materials if m and m.use_nodes}
images={n.image for m in materials for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image}
hero_ids=['dining_table','painted_wooden_chair_01','old_wooden_floor_02','grey_plaster_03','rough_linen','wood_table_worn','white_oak_veneer','forest_floor']
scaled=[]
for im in images:
 w,h=im.size;path=im.filepath.replace('\\','/').lower()
 # Tiny props need 1k, while large/close story surfaces remain 2k.
 maximum=2048 if not path or any('/'+id+'/' in path for id in hero_ids) else 1024
 if max(w,h)>maximum:
  factor=maximum/max(w,h);im.scale(max(1,round(w*factor)),max(1,round(h*factor)));im.pack();scaled.append(im.name)
memory=sum(im.size[0]*im.size[1]*4 for im in images)
# A human-height downward view documents that the waiting mark is now flat and very faint.
data=bpy.data.cameras.new('09 Porch wear detail');cam=bpy.data.objects.new('09 Porch wear detail',data);s.collection.objects.link(cam);cam.location=(-.2,6.45,1.65);cam.rotation_euler=(Vector((-.62,7.34,.02))-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=38
s.camera=cam;exposure=s.view_settings.exposure;s.view_settings.exposure=1.0;s.cycles.samples=24;s.render.filepath=os.path.join(OUT,'art_pressure_mark_detail.png');bpy.ops.render.render(write_still=True);s.view_settings.exposure=exposure
s.camera=bpy.data.objects['01 Kitchen']
try:bpy.data.orphans_purge(do_local_ids=True,do_linked_ids=False,do_recursive=True)
except:pass
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_ArtPass.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type in {'MESH','CURVE','FONT'} and not o.hide_render:o.select_set(True)
buf=io.StringIO();dest=os.path.join(ROOT,'public','models','DogYears_ArtPass.glb')
with contextlib.redirect_stdout(buf):bpy.ops.export_scene.gltf(filepath=dest,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_extras=True,export_image_format='WEBP',export_image_quality=86)
report={'bytes':os.path.getsize(dest),'imageDatablocks':len(images),'baseTextureMiB':round(memory/1048576,1),'withMipsMiB':round(memory/1048576*4/3,1),'propsResizedTo1k':scaled}
print('PACKED ART PASS',json.dumps(report))
