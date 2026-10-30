import bpy,os,math,random
from mathutils import Vector
ROOT=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(ROOT,'deliverables')
bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT,'DogYears_House.blend'))
s=bpy.context.scene
# Faded warm greys, not blue night. Keep the wear and the old-house material detail.
for m in bpy.data.materials:
 if not m.use_nodes:continue
 for node in m.node_tree.nodes:
  if node.type=='BSDF_PRINCIPLED':
   c=node.inputs['Base Color'].default_value[:];node.inputs['Base Color'].default_value=(min(.95,c[0]*1.22),min(.95,c[1]*1.12),min(.95,c[2]*.97),1)
  if node.type=='VALTORGB':
   for el in node.color_ramp.elements:
    c=el.color[:];el.color=(min(.95,c[0]*1.22),min(.95,c[1]*1.12),min(.95,c[2]*.97),1)
for o in s.objects:
 if o.type!='LIGHT':continue
 if o.name.startswith('Window'):o.data.energy=145;o.data.color=(.90,.85,.73);o.data.size=2
 elif o.name.startswith('Bounce'):o.data.energy=52;o.data.color=(.82,.82,.76)
 elif o.name.startswith('Lamp glow'):o.data.energy=0
 elif o.data.type=='SUN':
  o.data.energy=2.6;o.data.color=(1,.89,.69);o.data.angle=.035
  o.rotation_euler=(Vector((0,0,0))-Vector((-14,-6,7))).to_track_quat('-Z','Y').to_euler()
bg=next(n for n in s.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.44,.47,.48,1);bg.inputs[1].default_value=.42
s.view_settings.exposure=.05
# Half-lowered old blinds interrupt the afternoon sun and cast narrow slatted shadows.
col=bpy.data.collections.get('01 Architecture');paint=bpy.data.materials.get('Ivory painted joinery')
for x in [-5.35,5.35]:
 for cy in [-3.5,3.1]:
  for i in range(8):
   bpy.ops.mesh.primitive_cube_add(size=1,location=(x,cy,2.63-i*.075));o=bpy.context.view_layer.objects.active;o.name='Old blind | sun blocker';o.dimensions=(.13,2.05,.026);o.rotation_euler.y=.20
   bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
   for c in list(o.users_collection):c.objects.unlink(o)
   col.objects.link(o);o.data.materials.append(paint)
   mod=o.modifiers.new('Worn slat edge','BEVEL');mod.width=.006;mod.segments=2
  # Pull cords, aged and slightly off-centre.
  for dy in [-.72,.72]:
   cu=bpy.data.curves.new('Blind cord','CURVE');cu.dimensions='3D';cu.bevel_depth=.002
   sp=cu.splines.new('POLY');sp.points.add(1);sp.points[0].co=(x+.02,cy+dy,2.66,1);sp.points[1].co=(x+.02,cy+dy,1.96,1)
   o=bpy.data.objects.new('Blind | old cotton cord',cu);col.objects.link(o);cu.materials.append(paint)
# Keep rain marks extremely subtle; the dominant feeling is a dry, suspended afternoon.
for o in s.objects:
 if o.name.startswith('Window | rain trace'):o.hide_render=True;o.hide_viewport=True
s.camera=bpy.data.objects['01 Kitchen'];s.cycles.samples=32;s.render.resolution_percentage=65
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'DogYears_House.blend'))
for n,f in [('01 Kitchen','07_memory_kitchen'),('02 Bedroom','08_memory_bedroom')]:
 s.camera=bpy.data.objects[n];s.render.filepath=os.path.join(OUT,f+'.png');bpy.ops.render.render(write_still=True)
print('Memory daylight pass saved and rendered')
