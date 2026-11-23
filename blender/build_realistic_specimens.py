"""
Builds 4 UNMISTAKABLE, REALISTIC, HIGH-CRAFT 3D MODELS in Blender 5.3:
  1. cortical-instrument.glb   — Pure, unobstructed REAL anatomical human brain
                                 (FreeSurfer fsaverage6 pial cortex + MNI152 Cerebellum +
                                  Brainstem + smoked-glass Thalamus/Hippocampus + Corpus Callosum)
  2. artifact-eeg-field.glb    — REAL 10-20 High-Density EEG Electrode Cap & Sensor Harness
                                 mounted directly onto the anatomical FreeSurfer brain with
                                 machined gold-cup disc electrodes, elastic montage straps,
                                 insulated lead wires routing cleanly to an occipital connector pod!
  3. artifact-geospatial.glb   — REAL Earth-Observation Multispectral Satellite (gold Kapton MLI bus,
                                 dual gridded photovoltaic solar wings, optical nadir telescope,
                                 high-gain dish antenna) scanning a detailed geological terrain block!
  4. artifact-eval-prism.glb   — REAL Industrial Cutaway Enterprise GPU / AI Inference Compute Module
                                 (CNC anodized aluminum chassis, precision finned heatsinks, copper
                                 heatpipes, dual GPU tensor dies, twin cooling shrouds, gold edge
                                 interconnects & structured fiber-optic channel manifold)!

Also renders clean Cycles verification stills so every model can be visually verified!
"""

import math
import os
import bpy
import bmesh
import numpy as np
from mathutils import Vector, Matrix, noise

ROOT = "/Users/k/gareth.cv"
CACHE_PATH = os.path.join(ROOT, "blender/neuroanatomy_cache.npz")
MODELS_DIR = os.path.join(ROOT, "public/assets/models")
ENV_DIR = os.path.join(ROOT, "public/assets/env")
IMAGES_DIR = os.path.join(ROOT, "public/assets/images")
SCRATCH_DIR = "/Users/k/.gemini/antigravity/brain/fed523a8-ae76-450d-bf0a-999386dbeb7b/scratch"
os.makedirs(SCRATCH_DIR, exist_ok=True)

MM_TO_UNIT = 1.0 / 56.0


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def set_smooth(obj, smooth=True):
    if obj.type != "MESH" or not obj.data:
        return
    mesh = obj.data
    n = len(mesh.polygons)
    if n > 0:
        mesh.polygons.foreach_set("use_smooth", [smooth] * n)
    mesh.update()


def make_pbr_material(
    name,
    base_color=(0.08, 0.09, 0.12, 1.0),
    metallic=0.0,
    roughness=0.4,
    emission_color=(0.0, 0.0, 0.0, 1.0),
    emission_strength=0.0,
    coat_weight=0.0,
    coat_roughness=0.18,
    transmission=0.0,
    ior=1.5,
    alpha=1.0,
):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    def set_inp(key, val):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = val

    set_inp("Base Color", base_color)
    set_inp("Metallic", metallic)
    set_inp("Roughness", roughness)
    set_inp("Emission Color", emission_color)
    set_inp("Emission Strength", emission_strength)
    set_inp("Coat Weight", coat_weight)
    set_inp("Coat Roughness", coat_roughness)
    set_inp("Transmission Weight", transmission)
    set_inp("IOR", ior)
    set_inp("Alpha", alpha)
    return mat


def make_cortical_material(name):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    vcol = nt.nodes.new("ShaderNodeVertexColor")
    vcol.layer_name = "Color"
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(vcol.outputs["Color"], sep.inputs["Color"])

    m1 = nt.nodes.new("ShaderNodeMath")
    m1.operation = "MULTIPLY"
    m1.inputs[1].default_value = 0.72
    nt.links.new(sep.outputs["Red"], m1.inputs[0])

    m2 = nt.nodes.new("ShaderNodeMath")
    m2.operation = "MULTIPLY"
    m2.inputs[1].default_value = 0.28
    nt.links.new(sep.outputs["Green"], m2.inputs[0])

    topo = nt.nodes.new("ShaderNodeMath")
    topo.operation = "ADD"
    nt.links.new(m1.outputs["Value"], topo.inputs[0])
    nt.links.new(m2.outputs["Value"], topo.inputs[1])

    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.20
    cr.elements[0].color = (0.004, 0.005, 0.008, 1.0)
    e1 = cr.elements.new(0.50)
    e1.color = (0.025, 0.028, 0.036, 1.0)
    e2 = cr.elements.new(0.78)
    e2.color = (0.085, 0.092, 0.112, 1.0)
    cr.elements[1].position = 0.96
    cr.elements[1].color = (0.180, 0.186, 0.205, 1.0)
    nt.links.new(topo.outputs["Value"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])

    r_ramp = nt.nodes.new("ShaderNodeMapRange")
    r_ramp.inputs["From Min"].default_value = 0.15
    r_ramp.inputs["From Max"].default_value = 0.90
    r_ramp.inputs["To Min"].default_value = 0.88
    r_ramp.inputs["To Max"].default_value = 0.36
    r_ramp.clamp = True
    nt.links.new(topo.outputs["Value"], r_ramp.inputs["Value"])
    nt.links.new(r_ramp.outputs["Result"], bsdf.inputs["Roughness"])

    bsdf.inputs["Metallic"].default_value = 0.24
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.25
        bsdf.inputs["Coat Roughness"].default_value = 0.30
    return mat


def mesh_from_bmesh(name, bm, material=None, parent=None, smooth=False):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    set_smooth(obj, smooth)
    return obj


def create_box(name, sx, sy, sz, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0, material=None, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    if bevel > 0.0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, affect="EDGES", clamp_overlap=True)
    obj = mesh_from_bmesh(name, bm, material=material, parent=parent, smooth=(bevel > 0.0))
    obj.location = loc
    obj.rotation_euler = rot
    return obj


def create_cyl(name, r1, r2, depth, segs=24, loc=(0, 0, 0), rot=(0, 0, 0), material=None, parent=None, smooth=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1, radius2=r2, depth=depth)
    obj = mesh_from_bmesh(name, bm, material=material, parent=parent, smooth=smooth)
    obj.location = loc
    obj.rotation_euler = rot
    return obj


def create_tube(name, points, radius, material, parent=None, closed=False, resolution=8):
    bm = bmesh.new()
    pts = [Vector(p) for p in points]
    n_pts = len(pts)
    rings = []
    for i, p in enumerate(pts):
        if i == 0:
            tangent = (pts[1] - pts[0]).normalized() if not closed else (pts[1] - pts[-1]).normalized()
        elif i == n_pts - 1:
            tangent = (pts[-1] - pts[-2]).normalized() if not closed else (pts[0] - pts[-2]).normalized()
        else:
            tangent = (pts[i + 1] - pts[i - 1]).normalized()
        if tangent.length < 1e-6:
            tangent = Vector((0, 0, 1))
        up = Vector((0, 0, 1)) if abs(tangent.z) < 0.92 else Vector((1, 0, 0))
        s1 = tangent.cross(up).normalized()
        s2 = tangent.cross(s1).normalized()
        ring = [
            bm.verts.new(p + (s1 * math.cos(2.0 * math.pi * k / resolution) + s2 * math.sin(2.0 * math.pi * k / resolution)) * radius)
            for k in range(resolution)
        ]
        rings.append(ring)

    segs = n_pts if closed else n_pts - 1
    for i in range(segs):
        r0, r1 = rings[i], rings[(i + 1) % n_pts]
        for k in range(resolution):
            kn = (k + 1) % resolution
            bm.faces.new((r0[k], r1[k], r1[kn], r0[kn]))
    if not closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])

    return mesh_from_bmesh(name, bm, material=material, parent=parent, smooth=True)


def create_mesh_from_ras(name, verts_mm, faces, center_mm, vertex_rgb=None, material=None, parent=None, decimate_ratio=1.0):
    v_centered = (verts_mm - center_mm) * MM_TO_UNIT
    verts_bl = np.column_stack((-v_centered[:, 0], -v_centered[:, 1], v_centered[:, 2]))

    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts_bl.tolist(), [], faces.tolist())
    mesh.update()

    if vertex_rgb is not None:
        col_attr = mesh.color_attributes.new(name="Color", type="BYTE_COLOR", domain="POINT")
        rgba = np.ones((len(verts_bl), 4), dtype=np.float32)
        rgba[:, :3] = np.clip(vertex_rgb, 0.0, 1.0)
        col_attr.data.foreach_set("color", rgba.ravel())

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()

    if decimate_ratio < 0.995:
        mod = obj.modifiers.new("Decimate", "DECIMATE")
        mod.decimate_type = "COLLAPSE"
        mod.ratio = decimate_ratio
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)

    set_smooth(obj, True)
    return obj


def export_glb(filepath, active_vcol=False):
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        export_apply=True,
        export_normals=True,
        export_texcoords=False,
        export_vertex_color="ACTIVE" if active_vcol else "NONE",
        export_all_vertex_colors=active_vcol,
        export_materials="EXPORT",
        export_yup=True,
    )
    print(f"[EXPORT] {filepath} ({os.path.getsize(filepath)/1024:.1f} KB)")


def add_brain_core(root, data, decimate_cortex=0.62):
    """Builds the shared anatomical FreeSurfer brain + MNI152 cerebellum/brainstem/subcortical."""
    lh_verts, lh_faces = data["lh_verts"], data["lh_faces"]
    rh_verts, rh_faces = data["rh_verts"], data["rh_faces"]
    all_c = np.vstack([lh_verts, rh_verts])
    center_mm = np.array([
        0.0,
        0.5 * (all_c[:, 1].min() + all_c[:, 1].max()),
        0.5 * (all_c[:, 2].min() + all_c[:, 2].max()) - 8.0,
    ], dtype=np.float32)

    mat_cortex = make_cortical_material("Mat_RealCortex")
    mat_cereb = make_cortical_material("Mat_RealCerebellum")
    mat_stem = make_pbr_material("Mat_RealBrainstem", (0.045, 0.048, 0.058, 1.0), metallic=0.28, roughness=0.52)
    mat_subcort = make_pbr_material("Mat_SubcorticalGlass", (0.82, 0.88, 0.92, 1.0), roughness=0.12, transmission=0.82, ior=1.5, coat_weight=0.75, alpha=0.84)
    mat_vermilion = make_pbr_material("Mat_VermilionSignal", (0.94, 0.28, 0.18, 1.0), emission_color=(0.94, 0.28, 0.18, 1.0), emission_strength=2.8)
    mat_phosphor = make_pbr_material("Mat_PhosphorSignal", (0.24, 0.85, 0.70, 1.0), emission_color=(0.24, 0.85, 0.70, 1.0), emission_strength=2.4)
    mat_gold = make_pbr_material("Mat_ChampagneBrass", (0.82, 0.68, 0.46, 1.0), metallic=0.92, roughness=0.25)

    lh_rgb = np.column_stack([data["lh_sulc"], data["lh_curv"], data["lh_fpn"]])
    rh_rgb = np.column_stack([data["rh_sulc"], data["rh_curv"], data["rh_fpn"]])

    create_mesh_from_ras("Cortex_Right", lh_verts, lh_faces, center_mm, lh_rgb, mat_cortex, root, decimate_cortex)
    create_mesh_from_ras("Cortex_Left", rh_verts, rh_faces, center_mm, rh_rgb, mat_cortex, root, decimate_cortex)

    # Cerebellum with realistic fine horizontal folia
    cv = data["cereb_verts"]
    folia = 0.5 + 0.5 * np.sin(cv[:, 2] * 1.65 + np.cos(cv[:, 0] * 0.18) * 1.4)
    cc = cv.mean(axis=0)
    dirs = cv - cc
    dirs /= np.linalg.norm(dirs, axis=1, keepdims=True) + 1e-6
    cv_s = cv + dirs * ((folia[:, None] - 0.5) * 1.3)
    c_rgb = np.column_stack([0.22 + folia * 0.65, 0.30 + folia * 0.55, np.zeros_like(folia)]).astype(np.float32)
    create_mesh_from_ras("Cerebellum", cv_s, data["cereb_faces"], center_mm, c_rgb, mat_cereb, root, 0.60)
    create_mesh_from_ras("Brainstem", data["stem_verts"], data["stem_faces"], center_mm, None, mat_stem, root, 0.45)

    # Internal Thalamus + Hippocampus + Corpus Callosum commissural tracts
    core = bpy.data.objects.new("Core_Prism", None)
    bpy.context.collection.objects.link(core)
    core.parent = root
    create_mesh_from_ras("Subcortical_Thalamus_Hippocampus", data["subcort_verts"], data["subcort_faces"], center_mm, None, mat_subcort, core, 0.40)

    for i in range(11):
        t = i / 10.0
        y_mm = 30.0 - t * 68.0
        z_arch = 10.0 + 18.0 * math.sin(t * math.pi)
        pts_mm = [
            np.array([-26.0, y_mm, z_arch - 8.0]),
            np.array([-12.0, y_mm, z_arch + 3.0]),
            np.array([0.0, y_mm, z_arch + 5.0]),
            np.array([12.0, y_mm, z_arch + 3.0]),
            np.array([26.0, y_mm, z_arch - 8.0]),
        ]
        pts_bl = [
            Vector((-(p[0] - center_mm[0]) * MM_TO_UNIT, -(p[1] - center_mm[1]) * MM_TO_UNIT, (p[2] - center_mm[2]) * MM_TO_UNIT))
            for p in pts_mm
        ]
        bmat = mat_vermilion if i < 4 else (mat_phosphor if i >= 7 else mat_gold)
        create_tube(f"Callosum_Tract_{i}", pts_bl, 0.011, bmat, parent=core, resolution=6)

    return center_mm


# ─────────────────────────────────────────────────────────────────────────────
# SPECIMEN 01: PURE UNOBSTRUCTED ANATOMICAL HUMAN BRAIN (ZERO SCI-FI RINGS!)
# ─────────────────────────────────────────────────────────────────────────────

def build_specimen_01_brain(export=True):
    print("\n=== [1/4] Building Specimen 01: Pure Real Human Brain (cortical-instrument.glb) ===")
    clear_scene()
    data = np.load(CACHE_PATH)
    root = bpy.data.objects.new("CorticalInstrumentRoot", None)
    bpy.context.collection.objects.link(root)
    add_brain_core(root, data, decimate_cortex=0.62)

    if export:
        export_glb(os.path.join(MODELS_DIR, "cortical-instrument.glb"), active_vcol=True)
    return root


# ─────────────────────────────────────────────────────────────────────────────
# SPECIMEN 02: REAL 10-20 EEG ELECTRODE MONTAGE & RESEARCH SENSOR RIG
# ─────────────────────────────────────────────────────────────────────────────

def build_specimen_02_eeg_montage(export=True):
    print("\n=== [2/4] Building Specimen 02: Real 10-20 EEG Electrode Cap Montage (artifact-eeg-field.glb) ===")
    clear_scene()
    data = np.load(CACHE_PATH)
    root = bpy.data.objects.new("EEGMontageRoot", None)
    bpy.context.collection.objects.link(root)

    # Slightly lighter cortex mesh so EEG cap + brain stays fast and sharp
    center_mm = add_brain_core(root, data, decimate_cortex=0.42)

    mat_gold = make_pbr_material("Mat_ChampagneBrass", (0.85, 0.68, 0.36, 1.0), metallic=0.95, roughness=0.22)
    mat_housing = make_pbr_material("Mat_TitaniumDark", (0.14, 0.16, 0.20, 1.0), metallic=0.75, roughness=0.36)
    mat_strap = make_pbr_material("Mat_ObsidianMatte", (0.06, 0.07, 0.09, 1.0), metallic=0.10, roughness=0.72)
    mat_wire_r = make_pbr_material("Mat_VermilionSignal", (0.92, 0.28, 0.18, 1.0), metallic=0.15, roughness=0.35, emission_color=(0.92, 0.28, 0.18, 1.0), emission_strength=0.65)
    mat_wire_t = make_pbr_material("Mat_PhosphorSignal", (0.22, 0.85, 0.70, 1.0), metallic=0.15, roughness=0.35, emission_color=(0.22, 0.85, 0.70, 1.0), emission_strength=0.65)

    def mni_to_bl(pos_mm):
        p = np.array(pos_mm, dtype=np.float32)
        return Vector((-(p[0] - center_mm[0]) * MM_TO_UNIT, -(p[1] - center_mm[1]) * MM_TO_UNIT, (p[2] - center_mm[2]) * MM_TO_UNIT))

    # Full 21-channel International 10-20 EEG scalp positions (mm)
    electrodes = {
        "Fp1": (-29, 77, 15), "Fpz": (0, 82, 16), "Fp2": (29, 77, 15),
        "F7": (-64, 42, 6), "F3": (-50, 44, 54), "Fz": (0, 50, 74), "F4": (50, 44, 54), "F8": (64, 42, 6),
        "T7": (-79, -14, 4), "C3": (-64, -14, 65), "Cz": (0, -14, 92), "C4": (64, -14, 65), "T8": (79, -14, 4),
        "P7": (-65, -72, 8), "P3": (-52, -70, 58), "Pz": (0, -76, 75), "P4": (52, -70, 58), "P8": (65, -72, 8),
        "O1": (-30, -112, 14), "Oz": (0, -116, 16), "O2": (30, -112, 14),
    }

    # Occipital EEG amplifier junction pod behind cerebellum/neck
    amp_pos = mni_to_bl((0, -126, -34))
    create_box("EEG_Amplifier_Pod", 0.56, 0.24, 0.34, loc=amp_pos, rot=(math.radians(22), 0, 0), bevel=0.025, material=mat_housing, parent=root)
    create_box("EEG_Amp_Trim", 0.52, 0.25, 0.04, loc=amp_pos + Vector((0, 0, 0.06)), rot=(math.radians(22), 0, 0), bevel=0.008, material=mat_gold, parent=root)
    # Main braided output cable descending cleanly from amp pod
    create_tube("EEG_Main_Trunk", [amp_pos, amp_pos + Vector((0, 0.14, -0.45)), amp_pos + Vector((0, 0.26, -0.88))], 0.042, mat_strap, parent=root, resolution=10)

    bl_pts = {}
    for name, mm in electrodes.items():
        pos = mni_to_bl(mm)
        bl_pts[name] = pos
        normal = pos.normalized()
        rot = normal.to_track_quat("Z", "Y").to_euler()

        # Real sintered Ag/AgCl / gold-cup electrode sensor housing + gold contact disc
        create_cyl(f"EEG_Cup_{name}", 0.068, 0.060, 0.036, segs=18, loc=pos, rot=rot, material=mat_housing, parent=root)
        create_cyl(f"EEG_GoldDisc_{name}", 0.048, 0.048, 0.022, segs=18, loc=pos - normal * 0.014, rot=rot, material=mat_gold, parent=root)
        is_frontal = name.startswith("F")
        create_cyl(f"EEG_CapLED_{name}", 0.018, 0.018, 0.012, segs=12, loc=pos + normal * 0.022, rot=rot, material=(mat_wire_r if is_frontal else mat_wire_t), parent=root)

        # Route sensor lead wire strictly along the upper/lateral scalp harness toward the occipital pod (never drooping under chin!)
        target_pod = amp_pos + Vector((pos.x * 0.14, -0.05, 0.08))
        wire_pts = []
        n_arc = 14
        r_start = pos.length + 0.032
        r_end = target_pod.length + 0.015
        # Always route over the superior/lateral crown (positive Z bias) so wires hug the EEG cap cleanly
        crown_bias = Vector((math.copysign(0.35, pos.x) if abs(pos.x) > 0.15 else 0.0, 0.35, 0.85)).normalized()
        u0 = pos.normalized()
        u1 = target_pod.normalized()
        for step in range(n_arc + 1):
            t = step / float(n_arc)
            if step == 0:
                wire_pts.append(pos + normal * 0.022)
            elif step == n_arc:
                wire_pts.append(target_pod)
            else:
                # Quadratic Bezier direction pulled gently over the dorsal/lateral cap silhouette
                b_dir = ((1 - t) ** 2) * u0 + 2 * (1 - t) * t * crown_bias + (t ** 2) * u1
                b_dir.normalize()
                # Match anatomical ellipsoidal scalp envelope tightly
                sx = 1.48 if abs(b_dir.x) > 0.4 else 1.56
                r_env = (r_start * (1.0 - t) + r_end * t) * 0.55 + sx * 0.45
                wire_pts.append(b_dir * r_env)
        create_tube(f"EEG_Lead_{name}", wire_pts, 0.0048, mat_wire_r if is_frontal else mat_wire_t, parent=root, resolution=5)

    # Smooth geodesic elastic cap straps hugging outside the cortical contour
    strap_chains = [
        ["Fpz", "Fz", "Cz", "Pz", "Oz"],
        ["T7", "C3", "Cz", "C4", "T8"],
        ["F7", "F3", "Fz", "F4", "F8"],
        ["P7", "P3", "Pz", "P4", "P8"],
        ["Fpz", "Fp1", "F7", "T7", "P7", "O1", "Oz", "O2", "P8", "T8", "F8", "Fp2", "Fpz"],
    ]
    for idx, chain in enumerate(strap_chains):
        pts = []
        for k in range(len(chain) - 1):
            p0, p1 = bl_pts[chain[k]], bl_pts[chain[k + 1]]
            u0, u1 = p0.normalized(), p1.normalized()
            r0, r1 = p0.length, p1.length
            for s in range(5):
                t = s / 5.0
                d = u0.lerp(u1, t).normalized()
                r = r0 * (1.0 - t) + r1 * t + 0.022 * math.sin(t * math.pi)
                pts.append(d * r)
        pts.append(bl_pts[chain[-1]])
        create_tube(f"EEG_Cap_Strap_{idx}", pts, 0.013, mat_strap, parent=root, resolution=6)

    if export:
        export_glb(os.path.join(MODELS_DIR, "artifact-eeg-field.glb"), active_vcol=True)
    return root


# ─────────────────────────────────────────────────────────────────────────────
# SPECIMEN 03: REAL EARTH-OBSERVATION SATELLITE OVER GEOLOGICAL TERRAIN
# ─────────────────────────────────────────────────────────────────────────────

def build_specimen_03_satellite_terrain(export=True):
    print("\n=== [3/4] Building Specimen 03: Earth-Observation Satellite + Terrain (artifact-geospatial.glb) ===")
    clear_scene()
    root = bpy.data.objects.new("GeospatialRoot", None)
    bpy.context.collection.objects.link(root)

    mat_basalt = make_pbr_material("Mat_BasaltTerrain", (0.068, 0.064, 0.062, 1.0), metallic=0.12, roughness=0.72)
    mat_titanium = make_pbr_material("Mat_TitaniumDark", (0.20, 0.22, 0.26, 1.0), metallic=0.90, roughness=0.28)
    mat_kapton = make_pbr_material("Mat_ChampagneBrass", (0.86, 0.64, 0.24, 1.0), metallic=0.94, roughness=0.30, coat_weight=0.25)
    mat_solar = make_pbr_material("Mat_SolarSilicon", (0.035, 0.075, 0.165, 1.0), metallic=0.75, roughness=0.18, coat_weight=0.70)
    mat_lens = make_pbr_material("Mat_SmokedGlass", (0.20, 0.80, 0.72, 1.0), metallic=0.1, roughness=0.05, transmission=0.82, ior=1.52, coat_weight=0.9, alpha=0.85)
    mat_swath = make_pbr_material("Mat_PhosphorSignal", (0.22, 0.90, 0.72, 1.0), emission_color=(0.22, 0.90, 0.72, 1.0), emission_strength=2.2)
    mat_target = make_pbr_material("Mat_VermilionSignal", (0.94, 0.28, 0.18, 1.0), emission_color=(0.94, 0.28, 0.18, 1.0), emission_strength=2.8)

    # 1. Clean Closed Architectural Geological Block (realistic fBm ridge-and-valley relief)
    res = 72
    span = 2.62
    base_z = -1.08
    bm = bmesh.new()
    top_grid = []
    bot_grid = []
    for ix in range(res):
        t_row = []
        b_row = []
        u = (ix / (res - 1)) * 2.0 - 1.0
        for iy in range(res):
            v = (iy / (res - 1)) * 2.0 - 1.0
            p = Vector((u * 1.45, v * 1.45, 0.42))
            # Multi-octave geological fBm with crisp diagonal ridge spine & terraced elevation strata
            spine = math.exp(-((u * 0.72 + v * 0.55) ** 2) * 2.4) * 0.42
            fbm = (
                0.50 * (0.5 + 0.5 * noise.noise(p * 1.3 + Vector((2.1, -1.4, 0.5))))
                + 0.28 * (0.5 + 0.5 * noise.noise(p * 2.7 + Vector((-1.9, 3.2, 1.2))))
                + 0.14 * (0.5 + 0.5 * noise.noise(p * 5.6 + Vector((4.0, 1.1, 2.3))))
                + 0.08 * (0.5 + 0.5 * noise.noise(p * 11.0))
            )
            raw = spine + fbm * 0.48
            # Subtle architectural contour terracing (12 topographic contour levels)
            lvls = 12.0
            frac = raw * lvls - math.floor(raw * lvls)
            terraced = (math.floor(raw * lvls) + frac ** 2.4) / lvls
            z = base_z + 0.14 + terraced * 0.62
            x = u * span * 0.5
            y = v * span * 0.5
            t_row.append(bm.verts.new((x, y, z)))
            b_row.append(bm.verts.new((x, y, base_z)))
        top_grid.append(t_row)
        bot_grid.append(b_row)

    # Top terrain surface
    for ix in range(res - 1):
        for iy in range(res - 1):
            bm.faces.new((top_grid[ix][iy], top_grid[ix + 1][iy], top_grid[ix + 1][iy + 1], top_grid[ix][iy + 1]))

    # Clean vertical block skirts on all 4 edges down to base_z
    for ix in range(res - 1):
        bm.faces.new((bot_grid[ix][0], bot_grid[ix + 1][0], top_grid[ix + 1][0], top_grid[ix][0]))
        bm.faces.new((top_grid[ix][res - 1], top_grid[ix + 1][res - 1], bot_grid[ix + 1][res - 1], bot_grid[ix][res - 1]))
    for iy in range(res - 1):
        bm.faces.new((top_grid[0][iy], top_grid[0][iy + 1], bot_grid[0][iy + 1], bot_grid[0][iy]))
        bm.faces.new((bot_grid[res - 1][iy], bot_grid[res - 1][iy + 1], top_grid[res - 1][iy + 1], top_grid[res - 1][iy]))

    mesh_from_bmesh("Basalt_Terrain", bm, material=mat_basalt, parent=root, smooth=True)

    # Machined survey base slab directly beneath terrain block
    create_box("Terrain_Base", 2.74, 2.74, 0.12, loc=(0, 0, base_z - 0.06), bevel=0.015, material=mat_titanium, parent=root)

    # 3 subtle mineral prospectivity pins on geological peaks
    for idx, (px, py, pz) in enumerate([(0.32, -0.15, -0.35), (-0.52, 0.36, -0.42), (0.58, 0.44, -0.45)]):
        create_cyl(f"Target_Pin_{idx}", 0.008, 0.008, 0.28, segs=8, loc=(px, py, pz + 0.14), material=mat_kapton, parent=root)
        create_cyl(f"Target_Beacon_{idx}", 0.036, 0.0, 0.075, segs=6, loc=(px, py, pz + 0.31), material=mat_target, parent=root, smooth=False)

    # 2. REALISTIC EARTH-OBSERVATION HYPERSPECTRAL SATELLITE hovering in orbit above terrain!
    sat = bpy.data.objects.new("Satellite_Assembly", None)
    bpy.context.collection.objects.link(sat)
    sat.parent = root
    sat.location = (0.0, 0.0, 0.85)
    sat.rotation_euler = (math.radians(8), math.radians(-10), math.radians(18))

    # Main octagonal/box spacecraft bus wrapped in gold Kapton MLI foil + structural titanium rails
    create_box("Sat_Bus_Core", 0.54, 0.48, 0.62, loc=(0, 0, 0.05), bevel=0.035, material=mat_kapton, parent=sat)
    create_box("Sat_Bus_UpperDeck", 0.58, 0.52, 0.08, loc=(0, 0, 0.36), bevel=0.015, material=mat_titanium, parent=sat)
    create_box("Sat_Bus_LowerDeck", 0.58, 0.52, 0.08, loc=(0, 0, -0.26), bevel=0.015, material=mat_titanium, parent=sat)

    # Nadir-pointing Hyperspectral Optical Telescope Barrel + Sun Baffle + Sapphire Objective Lens
    create_cyl("Sat_Camera_Barrel", 0.19, 0.21, 0.34, segs=28, loc=(0, 0, -0.44), material=mat_titanium, parent=sat)
    create_cyl("Sat_Camera_Ring", 0.22, 0.22, 0.04, segs=28, loc=(0, 0, -0.60), material=mat_kapton, parent=sat)
    create_cyl("Sat_Camera_Lens", 0.165, 0.165, 0.03, segs=24, loc=(0, 0, -0.59), material=mat_lens, parent=sat)

    # High-Gain Parabolic X-Band Communications Dish mounted on top-side boom
    create_cyl("Sat_Dish_Boom", 0.022, 0.022, 0.26, segs=12, loc=(0.24, 0.22, 0.44), rot=(math.radians(-24), math.radians(22), 0), material=mat_titanium, parent=sat)
    bm_dish = bmesh.new()
    segs_r, segs_a = 10, 28
    rings = []
    for ir in range(segs_r):
        t = ir / (segs_r - 1)
        r = 0.02 + t * 0.24
        z = (r * r) * 1.4
        rings.append([bm_dish.verts.new((r * math.cos(2 * math.pi * ia / segs_a), r * math.sin(2 * math.pi * ia / segs_a), z)) for ia in range(segs_a)])
    for ir in range(segs_r - 1):
        for ia in range(segs_a):
            ian = (ia + 1) % segs_a
            bm_dish.faces.new((rings[ir][ia], rings[ir + 1][ia], rings[ir + 1][ian], rings[ir][ian]))
    dish = mesh_from_bmesh("Sat_Dish", bm_dish, material=mat_titanium, parent=sat, smooth=True)
    dish.location = (0.30, 0.28, 0.54)
    dish.rotation_euler = (math.radians(-35), math.radians(30), 0)
    mod_d = dish.modifiers.new("Solidify", "SOLIDIFY")
    mod_d.thickness = 0.015
    create_cyl("Sat_Dish_Feed", 0.012, 0.022, 0.16, segs=12, loc=(0.35, 0.34, 0.60), rot=(math.radians(-35), math.radians(30), 0), material=mat_kapton, parent=sat)

    # Dual Articulated Photovoltaic Solar Panel Wings (Left & Right, 3 hinged panels each with visible aluminum truss frames!)
    for side in (-1.0, 1.0):
        # Root yoke connecting bus to solar array
        create_cyl(f"Solar_Yoke_{side:+.0f}", 0.024, 0.024, 0.30, segs=12, loc=(side * 0.40, 0, 0.08), rot=(0, math.pi / 2, 0), material=mat_titanium, parent=sat)
        for p_idx in range(3):
            px = side * (0.76 + p_idx * 0.56)
            # Aluminum structural frame
            create_box(f"Solar_Frame_{side:+.0f}_{p_idx}", 0.52, 0.72, 0.024, loc=(px, 0, 0.08), rot=(math.radians(16), 0, 0), bevel=0.005, material=mat_titanium, parent=sat)
            # Photovoltaic silicon cell sheet
            create_box(f"Solar_Cells_{side:+.0f}_{p_idx}", 0.47, 0.66, 0.030, loc=(px, 0, 0.08), rot=(math.radians(16), 0, 0), material=mat_solar, parent=sat)
            # Crisp gold busbar grid ribs across panel
            for g in (-0.16, 0.0, 0.16):
                create_box(f"Solar_Rib_{side:+.0f}_{p_idx}_{g:.2f}", 0.012, 0.67, 0.034, loc=(px + g, 0, 0.08), rot=(math.radians(16), 0, 0), material=mat_kapton, parent=sat)

    # Delicate Optical Spectral Swath Scan Lines projecting from nadir lens onto the terrain ridge
    swath_corners = [(-0.88, -0.18, -0.58), (0.88, -0.18, -0.58), (0.88, 0.18, -0.58), (-0.88, 0.18, -0.58)]
    lens_origin = Vector((0.0, 0.0, 0.25))
    for i, sc in enumerate(swath_corners):
        create_tube(f"Swath_Ray_{i}", [lens_origin, Vector(sc)], 0.006, mat_swath, parent=root, resolution=5)
    create_tube("Spectral_Scan_Beam", [Vector((-0.88, 0.0, -0.55)), Vector((0.88, 0.0, -0.55))], 0.012, mat_swath, parent=root, resolution=6)

    if export:
        export_glb(os.path.join(MODELS_DIR, "artifact-geospatial.glb"), active_vcol=False)
    return root


# ─────────────────────────────────────────────────────────────────────────────
# SPECIMEN 04: REAL INDUSTRIAL CUTAWAY ENTERPRISE AI GPU INFERENCE MODULE
# ─────────────────────────────────────────────────────────────────────────────

def build_specimen_04_gpu_compute(export=True):
    print("\n=== [4/4] Building Specimen 04: Industrial Enterprise GPU Compute Module (artifact-eval-prism.glb) ===")
    clear_scene()
    root = bpy.data.objects.new("ComputeModuleRoot", None)
    bpy.context.collection.objects.link(root)

    mat_chassis = make_pbr_material("Mat_TitaniumDark", (0.14, 0.15, 0.18, 1.0), metallic=0.92, roughness=0.26)
    mat_pcb = make_pbr_material("Mat_ObsidianMatte", (0.025, 0.032, 0.042, 1.0), metallic=0.18, roughness=0.45)
    mat_copper = make_pbr_material("Mat_CopperPipe", (0.78, 0.42, 0.24, 1.0), metallic=0.96, roughness=0.20)
    mat_gold = make_pbr_material("Mat_ChampagneBrass", (0.86, 0.68, 0.34, 1.0), metallic=0.96, roughness=0.20)
    mat_glass = make_pbr_material("Mat_SmokedGlass", (0.75, 0.86, 0.90, 1.0), roughness=0.06, transmission=0.86, ior=1.52, coat_weight=0.95, alpha=0.78)
    mat_led_t = make_pbr_material("Mat_PhosphorSignal", (0.24, 0.92, 0.74, 1.0), emission_color=(0.24, 0.92, 0.74, 1.0), emission_strength=3.0)
    mat_led_r = make_pbr_material("Mat_VermilionSignal", (0.96, 0.28, 0.18, 1.0), emission_color=(0.96, 0.28, 0.18, 1.0), emission_strength=3.0)

    # 1. Precision CNC-Milled Anodized Aluminum 2U Inference Blade Base Chassis
    create_box("Chassis_Base", 2.48, 1.56, 0.10, loc=(0, 0, -0.34), bevel=0.022, material=mat_chassis, parent=root)
    # Matte black server PCB mother-board
    create_box("Server_PCB", 2.34, 1.42, 0.05, loc=(0, 0, -0.26), bevel=0.008, material=mat_pcb, parent=root)

    # Rear & Front Machined Faceplates with Rack-Mount Ears & Ventilation Slots
    create_box("Chassis_FrontRail", 2.48, 0.08, 0.62, loc=(0, -0.74, -0.05), bevel=0.015, material=mat_chassis, parent=root)
    create_box("Chassis_BackRail", 2.48, 0.08, 0.62, loc=(0, 0.74, -0.05), bevel=0.015, material=mat_chassis, parent=root)
    # Precision front rack-mount handles (left & right)
    for sx in (-1.14, 1.14):
        create_box(f"Rack_Ear_{sx:+.1f}", 0.10, 0.20, 0.56, loc=(sx, -0.84, -0.05), bevel=0.012, material=mat_chassis, parent=root)
        create_cyl(f"Rack_Bolt_{sx:+.1f}", 0.028, 0.028, 0.04, segs=12, loc=(sx, -0.94, 0.12), rot=(math.pi / 2, 0, 0), material=mat_gold, parent=root)
        create_cyl(f"Rack_BoltB_{sx:+.1f}", 0.028, 0.028, 0.04, segs=12, loc=(sx, -0.94, -0.22), rot=(math.pi / 2, 0, 0), material=mat_gold, parent=root)

    # Front Telemetry Status LEDs + Dual QSFP Fiber-Optic Transceiver Ports
    for i in range(6):
        lx = -0.86 + i * 0.12
        create_box(f"Front_LED_{i}", 0.055, 0.02, 0.022, loc=(lx, -0.785, 0.14), material=(mat_led_r if i == 0 else mat_led_t), parent=root)
    for i in range(4):
        px = 0.22 + i * 0.22
        create_box(f"QSFP_Port_{i}", 0.15, 0.09, 0.10, loc=(px, -0.76, -0.08), bevel=0.008, material=mat_gold, parent=root)

    # 2. Dual Silicon GPU Tensor Accelerator Packages + Precision Finned CNC Heatsinks
    for g_idx, gx in enumerate((-0.56, 0.56)):
        # Package substrate + gleaming silicon die + gold micro-capacitor ring
        create_box(f"GPU_Substrate_{g_idx}", 0.78, 0.78, 0.045, loc=(gx, 0.02, -0.21), bevel=0.008, material=mat_pcb, parent=root)
        create_box(f"GPU_Coldplate_{g_idx}", 0.52, 0.52, 0.06, loc=(gx, 0.02, -0.16), bevel=0.008, material=mat_copper, parent=root)
        # 4 HBM3 Memory Stack Chips flanking the GPU die
        for hy in (-0.28, 0.32):
            for hx in (-0.18, 0.18):
                create_box(f"HBM_{g_idx}_{hx:.1f}_{hy:.1f}", 0.16, 0.11, 0.045, loc=(gx + hx, hy, -0.19), bevel=0.004, material=mat_chassis, parent=root)

        # Array of 14 CNC-milled anodized aluminum cooling fins above each GPU
        bm_fins = bmesh.new()
        for f_i in range(14):
            fx = gx - 0.36 + (f_i / 13.0) * 0.72
            m = Matrix.Translation((fx, 0.02, 0.03)) @ Matrix.Diagonal((0.016, 0.76, 0.34, 1.0))
            bmesh.ops.create_cube(bm_fins, size=1.0, matrix=m)
        mesh_from_bmesh(f"Heatsink_Fins_{g_idx}", bm_fins, material=mat_chassis, parent=root, smooth=False)

        # 3 Curved Copper Vapor-Chamber Heatpipes piercing through each heatsink
        for hp_i, hp_y in enumerate((-0.20, 0.02, 0.24)):
            pts = [
                Vector((gx - 0.42, hp_y, -0.14)),
                Vector((gx - 0.38, hp_y, 0.14)),
                Vector((gx + 0.38, hp_y, 0.14)),
                Vector((gx + 0.42, hp_y, -0.14)),
            ]
            create_tube(f"Heatpipe_{g_idx}_{hp_i}", pts, 0.022, mat_copper, parent=root, resolution=10)

    # 3. High-Speed NVLink / Gold Interconnect Bus Bridging the Dual GPU Packages
    for b_i in range(5):
        by = -0.24 + b_i * 0.13
        create_box(f"NVLink_Bridge_{b_i}", 0.46, 0.045, 0.035, loc=(0.0, by, -0.16), bevel=0.005, material=mat_gold, parent=root)

    # Twin Precision Axial Cooling Blower Rotors at Rear Exhaust
    for f_idx, fx in enumerate((-0.62, 0.62)):
        rotor = bpy.data.objects.new(f"Cooling_Fan_{f_idx}", None)
        bpy.context.collection.objects.link(rotor)
        rotor.parent = root
        rotor.location = (fx, 0.56, -0.04)
        rotor.rotation_euler = (math.pi / 2, 0, 0)
        create_cyl(f"Fan_Hub_{f_idx}", 0.075, 0.075, 0.08, segs=18, material=mat_gold, parent=rotor)
        for bl in range(7):
            ang = 2.0 * math.pi * bl / 7.0
            create_box(
                f"Fan_Blade_{f_idx}_{bl}",
                0.15, 0.055, 0.012,
                loc=(0.13 * math.cos(ang), 0.13 * math.sin(ang), 0.0),
                rot=(math.radians(26), 0.0, ang),
                material=mat_chassis,
                parent=rotor,
            )

    # Gold PCIe Edge Connector Fingers along rear/side expansion bus
    bm_pins = bmesh.new()
    for p_i in range(28):
        px = -0.92 + p_i * 0.068
        m = Matrix.Translation((px, -0.64, -0.22)) @ Matrix.Diagonal((0.032, 0.10, 0.025, 1.0))
        bmesh.ops.create_cube(bm_pins, size=1.0, matrix=m)
    mesh_from_bmesh("Gold_Bus_Contacts", bm_pins, material=mat_gold, parent=root, smooth=False)

    # 4. Open-Top Industrial Cutaway Frame Side-Rails (exposing dual GPU heatsinks, copper pipes & NVLink clearly!)
    for sx in (-1.20, 1.20):
        create_box(f"Side_Rail_{sx:+.1f}", 0.08, 1.48, 0.58, loc=(sx, 0.0, -0.05), bevel=0.014, material=mat_chassis, parent=root)
        create_box(f"Top_Trim_{sx:+.1f}", 0.12, 1.48, 0.04, loc=(sx, 0.0, 0.26), bevel=0.008, material=mat_gold, parent=root)
    for sx in (-1.12, 1.12):
        for sy in (-0.64, 0.64):
            create_cyl(f"Standoff_{sx:.1f}_{sy:.1f}", 0.032, 0.032, 0.58, segs=12, loc=(sx, sy, -0.02), material=mat_gold, parent=root)

    if export:
        export_glb(os.path.join(MODELS_DIR, "artifact-eval-prism.glb"), active_vcol=False)
    return root


# ─────────────────────────────────────────────────────────────────────────────
# CYCLES VERIFICATION RENDERS FOR ALL 4 REALISTIC MODELS
# ─────────────────────────────────────────────────────────────────────────────

def render_cycles_still(root_obj, out_path, cam_loc, look_at, rot_deg, res=(1280, 720), exposure=0.1):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    scene.view_settings.view_transform = (
        "AgX" if "AgX" in [i.identifier for i in scene.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
    )
    scene.view_settings.exposure = exposure

    world = bpy.data.worlds.new("VerifyWorld")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg_lit = nt.nodes.new("ShaderNodeBackground")
    bg_cam = nt.nodes.new("ShaderNodeBackground")
    bg_cam.inputs[0].default_value = (0.008, 0.009, 0.013, 1.0)
    env_tex = nt.nodes.new("ShaderNodeTexEnvironment")
    env_tex.image = bpy.data.images.load(os.path.join(ENV_DIR, "studio-museum.hdr"))
    bg_lit.inputs[1].default_value = 0.85
    lp = nt.nodes.new("ShaderNodeLightPath")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(env_tex.outputs["Color"], bg_lit.inputs["Color"])
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(bg_lit.outputs["Background"], mix.inputs[1])
    nt.links.new(bg_cam.outputs["Background"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])

    def add_area(name, loc, target, energy, color, sx, sy):
        ld = bpy.data.lights.new(name, type="AREA")
        ld.energy = energy
        ld.color = color
        ld.shape = "RECTANGLE"
        ld.size = sx
        ld.size_y = sy
        lo = bpy.data.objects.new(name, ld)
        scene.collection.objects.link(lo)
        lo.location = loc
        lo.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()

    add_area("Key", (3.6, -4.8, 5.2), (0, 0, 0), 260, (1.0, 0.96, 0.90), 3.6, 2.0)
    add_area("RimCool", (-4.8, 3.2, 2.4), (0, 0, 0), 180, (0.72, 0.88, 1.0), 2.4, 4.0)
    add_area("FillWarm", (4.2, 3.0, -1.2), (0, 0, 0), 110, (1.0, 0.85, 0.72), 2.6, 2.2)

    root_obj.rotation_euler = tuple(math.radians(a) for a in rot_deg)
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = (Vector(look_at) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam_obj

    scene.render.image_settings.file_format = "PNG"
    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"[STILL] {out_path}")


if __name__ == "__main__":
    # 1. Pure Anatomical Brain + hero/OG stills
    r1 = build_specimen_01_brain(export=True)
    render_cycles_still(r1, os.path.join(IMAGES_DIR, "hero-cycles.png"), (-1.1, -8.2, 0.65), (-0.55, 0, -0.08), (8, 4, -58), res=(1600, 900), exposure=0.12)
    render_cycles_still(r1, os.path.join(IMAGES_DIR, "og-preview.png"), (0.0, -7.6, 0.60), (0, 0, -0.08), (8, 4, -58), res=(1200, 630), exposure=0.12)

    # 2. Real 10-20 EEG Montage + verify still
    r2 = build_specimen_02_eeg_montage(export=True)
    render_cycles_still(r2, os.path.join(SCRATCH_DIR, "verify-eeg-montage.png"), (0.0, -7.8, 1.35), (0, 0, -0.1), (8, 4, -52), res=(1024, 640), exposure=0.15)

    # 3. Real Earth-Observation Satellite + Terrain + verify still
    r3 = build_specimen_03_satellite_terrain(export=True)
    render_cycles_still(r3, os.path.join(SCRATCH_DIR, "verify-satellite.png"), (0.0, -8.8, 2.8), (0, 0, 0.0), (4, 0, -28), res=(1024, 640), exposure=0.25)

    # 4. Real Industrial GPU Inference Compute Module + verify still
    r4 = build_specimen_04_gpu_compute(export=True)
    render_cycles_still(r4, os.path.join(SCRATCH_DIR, "verify-gpu-module.png"), (0.0, -6.2, 3.6), (0, 0, -0.05), (4, 0, -32), res=(1024, 640), exposure=0.25)

    print("\nALL 4 REALISTIC 3D SPECIMENS BUILT & VERIFIED!")
