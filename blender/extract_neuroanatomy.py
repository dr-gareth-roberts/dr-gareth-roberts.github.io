"""
Extracts REAL human neuroanatomy from open-science FreeSurfer fsaverage6 + MNI152 atlases:
  - Left & Right Pial Cortical Surfaces (fsaverage6: 40,962 verts/hemisphere)
  - Real Sulcal Depth (sulc) & Mean Curvature (curv) per vertex
  - Anatomical Frontoparietal & Prefrontal Control Network (FPN + ACC) weight map
  - Real MNI152 Cerebellum & Brainstem meshes via Marching Cubes in true RAS mm space

Outputs: /Users/k/gareth.cv/blender/neuroanatomy_cache.npz
"""

import os
import numpy as np
import nibabel as nib
from nilearn import datasets
from scipy.ndimage import gaussian_filter
from skimage import measure

OUT_PATH = "/Users/k/gareth.cv/blender/neuroanatomy_cache.npz"


def normalize_robust(arr, lo_pct=4.0, hi_pct=96.0):
    lo, hi = np.percentile(arr, [lo_pct, hi_pct])
    return np.clip((arr - lo) / max(hi - lo, 1e-6), 0.0, 1.0)


def compute_fpn_weight(verts_mm):
    """
    Computes an anatomically grounded spatial weight map highlighting the
    Prefrontal / Frontoparietal Control Network & Anterior Cingulate Cortex (ACC)
    — the core neural architecture of Dr. Gareth Roberts' cognitive control research:
      - Dorsolateral Prefrontal Cortex (DLPFC): |x| ~ 35-52, y ~ 20-52, z ~ 15-45
      - Rostrolateral / Anterior PFC:           |x| ~ 22-40, y ~ 45-66, z ~ -2-26
      - Anterior Cingulate Cortex (ACC / dACC): |x| < 14,    y ~ 12-40, z ~ 18-44
      - Intraparietal Sulcus / Superior Parietal: |x| ~ 26-48, y ~ -64..-38, z ~ 36-58
    """
    ax = np.abs(verts_mm[:, 0])
    y = verts_mm[:, 1]
    z = verts_mm[:, 2]

    dlpfc = np.exp(-(((ax - 42.0) / 16.0) ** 2 + ((y - 34.0) / 18.0) ** 2 + ((z - 28.0) / 16.0) ** 2))
    rlpfc = np.exp(-(((ax - 28.0) / 15.0) ** 2 + ((y - 54.0) / 14.0) ** 2 + ((z - 12.0) / 15.0) ** 2))
    acc = np.exp(-(((ax - 6.0) / 10.0) ** 2 + ((y - 26.0) / 16.0) ** 2 + ((z - 30.0) / 14.0) ** 2))
    ips = np.exp(-(((ax - 38.0) / 16.0) ** 2 + ((y + 52.0) / 16.0) ** 2 + ((z - 46.0) / 14.0) ** 2))

    w = np.clip(np.maximum.reduce([dlpfc, rlpfc * 0.9, acc * 0.95, ips * 0.92]), 0.0, 1.0)
    return w.astype(np.float32)


def extract_marching_cubes(mask_vol, affine, smooth_sigma=1.1, step_size=1):
    vol = gaussian_filter(mask_vol.astype(np.float32), sigma=smooth_sigma)
    verts_vox, faces, _, _ = measure.marching_cubes(vol, level=0.45, step_size=step_size)
    # Apply affine to get true MNI RAS millimeter coordinates
    verts_ras = nib.affines.apply_affine(affine, verts_vox).astype(np.float32)
    # Ensure consistent outward winding when affine has negative determinant
    if np.linalg.det(affine[:3, :3]) < 0:
        faces = faces[:, ::-1]
    return verts_ras, faces.astype(np.int32)


def main():
    print("[1/3] Loading FreeSurfer fsaverage6 pial surfaces + sulcal/curvature maps...")
    fs = datasets.fetch_surf_fsaverage("fsaverage6")

    pial_l = nib.load(fs["pial_left"])
    pial_r = nib.load(fs["pial_right"])
    lh_verts = pial_l.darrays[0].data.astype(np.float32)
    lh_faces = pial_l.darrays[1].data.astype(np.int32)
    rh_verts = pial_r.darrays[0].data.astype(np.float32)
    rh_faces = pial_r.darrays[1].data.astype(np.int32)

    # In FreeSurfer GIFTI: sulc > 0 typically denotes sulcal depth or gyral height depending on convention;
    # Verify polarity directly using radial distance from hemisphere centroid so gyral crowns ALWAYS -> 1.0 and deep sulci -> 0.0!
    raw_sulc_l = nib.load(fs["sulc_left"]).darrays[0].data.astype(np.float32)
    raw_sulc_r = nib.load(fs["sulc_right"]).darrays[0].data.astype(np.float32)
    raw_curv_l = nib.load(fs["curv_left"]).darrays[0].data.astype(np.float32)
    raw_curv_r = nib.load(fs["curv_right"]).darrays[0].data.astype(np.float32)

    # Check correlation between sulc and distance from centroid (gyral crowns are further out radially)
    c_l = lh_verts.mean(axis=0)
    rad_l = np.linalg.norm(lh_verts - c_l, axis=1)
    corr_sulc = np.corrcoef(raw_sulc_l, rad_l)[0, 1]
    corr_curv = np.corrcoef(raw_curv_l, rad_l)[0, 1]
    print(f"   Polarity check: corr(sulc, radius)={corr_sulc:.3f}, corr(curv, radius)={corr_curv:.3f}")

    # Orient so 1.0 = outer gyral crown, 0.0 = deep sulcal valley
    if corr_sulc < 0:
        raw_sulc_l = -raw_sulc_l
        raw_sulc_r = -raw_sulc_r
    if corr_curv < 0:
        raw_curv_l = -raw_curv_l
        raw_curv_r = -raw_curv_r

    lh_sulc = normalize_robust(raw_sulc_l, 3.0, 97.0).astype(np.float32)
    rh_sulc = normalize_robust(raw_sulc_r, 3.0, 97.0).astype(np.float32)
    lh_curv = normalize_robust(raw_curv_l, 5.0, 95.0).astype(np.float32)
    rh_curv = normalize_robust(raw_curv_r, 5.0, 95.0).astype(np.float32)

    lh_fpn = compute_fpn_weight(lh_verts)
    rh_fpn = compute_fpn_weight(rh_verts)

    print(f"   LH: {lh_verts.shape[0]} verts, {lh_faces.shape[0]} faces | bbox {lh_verts.min(0).round(1)} .. {lh_verts.max(0).round(1)}")
    print(f"   RH: {rh_verts.shape[0]} verts, {rh_faces.shape[0]} faces | bbox {rh_verts.min(0).round(1)} .. {rh_verts.max(0).round(1)}")

    print("[2/3] Extracting real MNI152 Cerebellum (AAL) & Brainstem (Harvard-Oxford 1mm)...")
    ho = datasets.fetch_atlas_harvard_oxford("sub-maxprob-thr25-1mm")
    ho_img = nib.load(ho.maps) if isinstance(ho.maps, str) else ho.maps
    ho_data = ho_img.get_fdata()
    stem_idx = [i for i, lbl in enumerate(ho.labels) if "brain-stem" in lbl.lower() or "brainstem" in lbl.lower()]
    print("   Harvard-Oxford Brain-Stem index:", stem_idx)
    stem_mask = np.isin(ho_data, stem_idx)
    stem_verts, stem_faces = extract_marching_cubes(stem_mask, ho_img.affine, smooth_sigma=1.2, step_size=1)
    print(f"   Brainstem: {stem_verts.shape[0]} verts, {stem_faces.shape[0]} faces | bbox {stem_verts.min(0).round(1)} .. {stem_verts.max(0).round(1)}")

    # Extract real bilateral Thalamus + Hippocampus for the internal subcortical core
    subcort_idx = [
        i for i, lbl in enumerate(ho.labels)
        if "thalamus" in lbl.lower() or "hippocampus" in lbl.lower()
    ]
    subcort_mask = np.isin(ho_data, subcort_idx)
    subcort_verts, subcort_faces = extract_marching_cubes(subcort_mask, ho_img.affine, smooth_sigma=1.0, step_size=1)
    print(f"   Subcortical (Thalamus+Hippocampus): {subcort_verts.shape[0]} verts, {subcort_faces.shape[0]} faces")

    aal = datasets.fetch_atlas_aal()
    aal_img = nib.load(aal.maps) if isinstance(aal.maps, str) else aal.maps
    aal_data = aal_img.get_fdata()
    cereb_ids = [int(idx) for idx, lbl in zip(aal.indices, aal.labels) if "Cerebel" in lbl or "Vermis" in lbl]
    cereb_mask = np.isin(aal_data, cereb_ids)
    cereb_verts, cereb_faces = extract_marching_cubes(cereb_mask, aal_img.affine, smooth_sigma=0.95, step_size=1)
    print(f"   Cerebellum: {cereb_verts.shape[0]} verts, {cereb_faces.shape[0]} faces | bbox {cereb_verts.min(0).round(1)} .. {cereb_verts.max(0).round(1)}")

    print(f"[3/3] Saving {OUT_PATH} ...")
    np.savez_compressed(
        OUT_PATH,
        lh_verts=lh_verts,
        lh_faces=lh_faces,
        lh_sulc=lh_sulc,
        lh_curv=lh_curv,
        lh_fpn=lh_fpn,
        rh_verts=rh_verts,
        rh_faces=rh_faces,
        rh_sulc=rh_sulc,
        rh_curv=rh_curv,
        rh_fpn=rh_fpn,
        cereb_verts=cereb_verts,
        cereb_faces=cereb_faces,
        stem_verts=stem_verts,
        stem_faces=stem_faces,
        subcort_verts=subcort_verts,
        subcort_faces=subcort_faces,
    )
    print(f"   Saved {OUT_PATH} ({os.path.getsize(OUT_PATH)/1024:.1f} KB)")


if __name__ == "__main__":
    main()
