# Dr Gareth Roberts, PhD — Portfolio & Online CV

**Live:** https://dr-gareth-roberts.github.io/

Swiss architectural online CV paired with real-time Three.js WebGL and custom Blender 5.3 3D assets built from real open-science neuroanatomy and industrial/engineering models.

## 3D Assets & Pipeline

- **Anatomical Data Extraction** (`blender/extract_neuroanatomy.py`): Extracts real **FreeSurfer `fsaverage6`** bilateral cortical pial surfaces (`lh.pial`, `rh.pial`), sulcal depth (`sulc`), and mean curvature (`curv`), co-registered with **AAL3v2** cerebellum and **Harvard-Oxford 1mm** brainstem, thalamus, and hippocampus meshes in MNI RAS coordinates.
- **Blender 5.3 Procedural Asset Builder** (`blender/build_realistic_specimens.py`):
  - `public/assets/models/cortical-instrument.glb` — Pure unobstructed FreeSurfer `fsaverage6` human brain + MNI152 cerebellum, brainstem, smoked-glass thalamus/hippocampus, and corpus callosum tracts.
  - `public/assets/models/artifact-eeg-field.glb` — 21-channel International 10-20 EEG electrode cap harness, gold-cup sensors, dorsal scalp lead wires, and occipital amplifier pod.
  - `public/assets/models/artifact-geospatial.glb` — Earth-observation hyperspectral satellite (Kapton bus, dual solar wings, nadir optics, X-band dish) scanning a geological elevation block.
  - `public/assets/models/artifact-eval-prism.glb` — Open-top cutaway 2U enterprise GPU inference module with CNC-milled finned heatsinks, copper heatpipes, NVLink bridges, and spinning twin axial cooling fans.
  - `public/assets/env/studio-museum.hdr` — Blender Cycles equirectangular museum studio HDRI for PMREM reflections.
- **Three.js Engine & GLSL Shaders** (`src/scene/`):
  - `corticalShader.ts` — Real-time sulcal-depth chiaroscuro PBR shader reading baked FreeSurfer vertex attributes (`COLOR_0`), with Frontoparietal Control Network activation and traveling cortical sweeps.
  - `SceneController.ts` — ACES Filmic tone mapping, selective bloom, Lenis-synchronized scroll choreography, and full **360° Studio Orbit** inspection mode (`Studio`, `Signal`, and `Mesh` modes).
- **Typography & Executive CV Utility**:
  - **Switzer** (Swiss neo-grotesque), **Newsreader** (optical editorial serif), and **IBM Plex Mono**.
  - Career track filtering, live publication search & category filtering, one-click `Copy BibTeX`, editorial research plate lightbox, responsive mobile drawer, and tailored `@media print` A4 PDF export.

## Commands

```bash
npm install            # Install dependencies
npm run dev            # Start Vite dev server
npm run build          # Type-check + production bundle to dist/
npm run preview        # Preview production bundle on http://localhost:4173
npm run assets:blender # Rebuild all 4 GLB models & Cycles stills via Blender 5.3
```
