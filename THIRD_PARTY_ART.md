# Third-party art

The art pass incorporates the following artist-authored assets from [Poly Haven](https://polyhaven.com/), distributed under [CC0](https://polyhaven.com/license). Original geometry and scanned material detail are retained; placement, scale, restrained color grading and runtime tree LODs were adapted for DogYears. The house layout, story props and interaction design are original project work.

## Models

- [Painted Wooden Chair 01](https://polyhaven.com/a/painted_wooden_chair_01) — Kuutti Siitonen.
- [Dining Table](https://polyhaven.com/a/dining_table) — Aron Łyczek.
- [Side Table 01](https://polyhaven.com/a/side_table_01) — James Ray Cock.
- [Sofa 03](https://polyhaven.com/a/sofa_03) — Fran Calvente.
- [Vintage Cabinet 01](https://polyhaven.com/a/vintage_cabinet_01) — Rico Cilliers.
- [Desk Lamp Arm 01](https://polyhaven.com/a/desk_lamp_arm_01) — Kuutti Siitonen; rigging by Yann Kervran.
- [Book Encyclopedia Set 01](https://polyhaven.com/a/book_encyclopedia_set_01) — John Malcolm.
- [Potted Plant 04](https://polyhaven.com/a/potted_plant_04) — James Ray Cock.
- [Fern 02](https://polyhaven.com/a/fern_02) — scanning by Rob Tuytel, modeling by Rico Cilliers.
- [Standing Picture Frame 01](https://polyhaven.com/a/standing_picture_frame_01) — James Ray Cock.
- [Throw Pillows 01](https://polyhaven.com/a/throw_pillows_01) — Serhii Khromov. Geometry used with a quieter scanned linen treatment.
- [Vintage Electric Kettle](https://polyhaven.com/a/vintage_electric_kettle) — SV Garip.
- [Alarm Clock 01](https://polyhaven.com/a/alarm_clock_01) — James Ray Cock; rigging by Yann Kervran.
- [Tree Small 02](https://polyhaven.com/a/tree_small_02) — Rico Cilliers. Runtime LODs created separately for bark, branches and leaves.
- [Rock Moss Set 01](https://polyhaven.com/a/rock_moss_set_01) — Kless Gyzen. Individual eroded stones form the final garden path.

## Scanned materials

- [Old Wooden Floor 02](https://polyhaven.com/a/old_wooden_floor_02) — Charlotte Baglioni and Jenelle van Heerden.
- [Grey Plaster 03](https://polyhaven.com/a/grey_plaster_03) — Rob Tuytel.
- [Rough Linen](https://polyhaven.com/a/rough_linen) — colormass and Rico Cilliers.
- [Forest Floor](https://polyhaven.com/a/forest_floor) — eye-candy.xyz.
- [Weathered Peeling Timber](https://polyhaven.com/a/weathered_peeling_timber) — Dimitrios Savva.
- [White Oak Veneer](https://polyhaven.com/a/white_oak_veneer) — Jenelle van Heerden.
- [Wood Table Worn](https://polyhaven.com/a/wood_table_worn) — Dimitrios Savva and Rico Cilliers.
- [Jolcham Oak Bark 01](https://polyhaven.com/a/jolcham_oak_bark_01) — Charlotte Baglioni.
- [Brown Mud Dry](https://polyhaven.com/a/brown_mud_dry), [Aerial Grass Rock](https://polyhaven.com/a/aerial_grass_rock), and [Gravel Ground 01](https://polyhaven.com/a/gravel_ground_01) — Rob Tuytel.

## Environment

- [Autumn Field PureSky](https://polyhaven.com/a/autumn_field_puresky) — Poly Haven CC0 HDR environment. The game uses this for indirect illumination and surface reflections, independently of its moving sun.

Downloaded files and exact API source metadata are preserved in `reference/assets/manifest.json` and each asset's `files.json`. The previous procedural inspection model remains preserved as an earlier revision; the current art pass should be loaded from its own immutable model file.

The final far forest uses transparent distance captures rendered from the original full-detail CC0 tree. Near trees remain three-dimensional artist models. Original lake watercolor art supplied by the project is mapped only to the bedroom picture face.

The current runtime model is `DogYears_ArtPass_Hero.glb`. Near and middle-distance trees retain three-dimensional artist geometry. Far woodland uses transparent LOD captures of the same original tree on modeled terrain. The bedroom lake watercolor in `public/art/lake-watercolor.png` was generated for this project with OpenAI image generation; it is separate from the Poly Haven collection. The architectural miniature and fitted blue keepsake shirt are original project geometry.
