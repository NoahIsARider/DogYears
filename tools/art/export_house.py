import bpy,os,json
def _repo_root(start):
    p=os.path.dirname(os.path.abspath(start))
    while not os.path.exists(os.path.join(p,'package.json')) and os.path.dirname(p)!=p:
        p=os.path.dirname(p)
    return p

ROOT=_repo_root(__file__);OUT=os.path.join(ROOT,'deliverables');s=bpy.context.scene
os.makedirs(os.path.join(ROOT,'public','models'),exist_ok=True)
# Third pass: finer rain traces, more readable details within the dark interior.
for o in s.objects:
 if o.name.startswith('Window | rain trace') and o.type=='CURVE':o.data.bevel_depth=.00065
s.camera=bpy.data.objects['01 Kitchen'];s.render.resolution_percentage=100;s.cycles.samples=64
bpy.context.preferences.inputs.walk_navigation.walk_speed=1.5
# Set a human-height starting view looking along the hall.
from mathutils import Vector
rot=(Vector((0,5,1.55))-Vector((0,-5.4,1.65))).to_track_quat('-Z','Y')
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':
   reg=a.spaces.active.region_3d;reg.view_rotation=rot;reg.view_distance=.01;reg.view_location=(0,-5.39,1.65);reg.view_perspective='PERSP'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_House.blend'))
# Bake colour variation to portable texture maps for the GLB inspection model.
materials=set(m for o in s.objects if o.type=='MESH' for m in o.data.materials if m)
current=bpy.context.view_layer
bpy.ops.mesh.primitive_plane_add(size=2,location=(0,0,-20));plane=bpy.context.object;plane.name='Temporary material baker'
for m in materials:
 if not m.use_nodes or not any(n.type=='TEX_NOISE' for n in m.node_tree.nodes):continue
 nodes=m.node_tree.nodes;links=m.node_tree.links;p=next(n for n in nodes if n.type=='BSDF_PRINCIPLED');out=next(n for n in nodes if n.type=='OUTPUT_MATERIAL')
 base=p.inputs['Base Color']
 if not base.is_linked:continue
 source=base.links[0].from_socket
 img=bpy.data.images.new('Baked | '+m.name,width=256,height=256)
 tex=nodes.new('ShaderNodeTexImage');tex.image=img;nodes.active=tex
 em=nodes.new('ShaderNodeEmission');links.new(source,em.inputs['Color']);links.new(em.outputs[0],out.inputs['Surface'])
 plane.data.materials.clear();plane.data.materials.append(m)
 bpy.ops.object.select_all(action='DESELECT');plane.select_set(True);current.objects.active=plane
 s.cycles.samples=1
 bpy.ops.object.bake(type='EMIT',margin=4)
 links.new(p.outputs[0],out.inputs['Surface']);nodes.remove(em);links.new(tex.outputs['Color'],base)
 img.pack()
bpy.data.objects.remove(plane,do_unlink=True)
# Ceiling can be toggled separately by object name in the viewer.
bpy.ops.object.select_all(action='DESELECT')
for o in s.objects:
 if o.type in {'MESH','CURVE','FONT'}:o.select_set(True)
glb=os.path.join(ROOT,'public','models','DogYears_House.glb')
bpy.ops.export_scene.gltf(filepath=glb,export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False)
import shutil
shutil.copy2(glb,os.path.join(OUT,'DogYears_House.glb'))
print('EXPORTED',os.path.getsize(glb),'bytes. Blender source retains full procedural materials.')
