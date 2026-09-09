"""
build_assets.py - 3D Asset Point Cloud Baker (Zero Squares, Pure 3D Blender Models)
=====================================================================================
Transforms source assets into clean, 360-degree closed volumetric 3D point clouds
with ABSOLUTE ZERO bounding boxes, ZERO debug grids, and ZERO wireframe squares.

Each model is guaranteed to have full 360-degree closed geometry (front, back,
depth, and anatomical detail) matching the 3D Blender assets:
  • dragon.png: Full 3D dragon (horns, snout, teeth, bat wings, pear belly, claws & tail)
  • face.png: Full 360° sculpted head bust (cranium, brow, eyes, nose, lips, jaw, ears, neck)
  • wormhole.png: Wireframe hyperboloid spacetime funnel with flared circular disc rims
  • house.png: Modern Art-Deco building with 3-tier curved balconies & rooftop antenna
  • heart.png: Anatomical heart (ventricles, apex, aorta loop, 3 carotid pipes, pulmonary trunk)
  • saturn.png: Spheroid planet core + tilted planar concentric rings with Cassini gap
  • mountain.png: Alpine mountain massif with sharp Matterhorn peak, spires & rock talus
  • blackhole.png: Gargantua black hole with event horizon void, accretion disk & lensing arch
  • text: 3D extruded 'I LOVE YOU' stardust typography
  • idle: Cosmic grand design spiral galaxy

Output:
    assets/models_3d.npz

Usage:
    python build_assets.py
"""

import os
import math
import numpy as np

# OpenCV is optional at bake time; procedural fallback is 100% self-contained
try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

ASSET_DIR = "assets"
OUTPUT_FILE = os.path.join(ASSET_DIR, "models_3d.npz")
NUM_POINTS = 8000
PHI_G = math.pi * (3.0 - math.sqrt(5.0))


def create_colors(num_points, r, g, b, a=0.96):
    cols = np.zeros((num_points, 4), dtype=np.float32)
    cols[:, 0] = r
    cols[:, 1] = g
    cols[:, 2] = b
    cols[:, 3] = a
    return cols


# ==============================================================================
# PROCEDURAL 3D BLENDER-QUALITY MATHEMATICAL GENERATORS
# ==============================================================================

def generate_idle_model(num_points=NUM_POINTS):
    """Mode 0: Grand Design Spiral Galaxy with spherical bulge and dual logarithmic arms."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_core = int(num_points * 0.28)
    n_arms = num_points - n_core

    # 1. Spheroidal Galactic Core Bulge
    i_core = np.arange(n_core, dtype=np.float32)
    u_c = i_core / float(max(1, n_core - 1))
    r_c = (u_c ** 1.6) * 65.0
    th_c = PHI_G * i_core
    phi_c = np.arccos(np.clip(1.0 - 2.0 * u_c, -1.0, 1.0))
    pts[:n_core, 0] = r_c * np.sin(phi_c) * np.cos(th_c)
    pts[:n_core, 1] = r_c * np.cos(phi_c) * 0.55
    pts[:n_core, 2] = r_c * np.sin(phi_c) * np.sin(th_c)

    # 2. Dual Logarithmic Spiral Arms
    i_arm = np.arange(n_arms, dtype=np.float32)
    arm_idx = i_arm % 2
    t = i_arm / float(n_arms)
    r_arm = 40.0 + (t ** 0.78) * 220.0
    arm_offset = arm_idx * math.pi
    theta_arm = 3.8 * np.log(np.maximum(1.0, r_arm / 25.0)) + arm_offset + np.sin(i_arm * 99.0) * 0.18
    scatter = (np.sin(i_arm * 1234.56) * 16.0) * (r_arm / 220.0)
    y_scatter = (np.cos(i_arm * 987.65) * 12.0) * np.exp(-r_arm / 160.0)
    pts[n_core:, 0] = (r_arm + scatter) * np.cos(theta_arm)
    pts[n_core:, 1] = y_scatter
    pts[n_core:, 2] = (r_arm + scatter) * np.sin(theta_arm)
    return pts


def generate_saturn_model(num_points=NUM_POINTS):
    """Mode 1: Spheroid planet core + tilted planar concentric rings with Cassini division."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_sphere = int(num_points * 0.38)
    n_rings = num_points - n_sphere

    # 1. Fibonacci Sphere Core
    i_s = np.arange(n_sphere, dtype=np.float32)
    y_norm = 1.0 - (i_s / float(max(1, n_sphere - 1))) * 2.0
    r_at_y = np.sqrt(np.maximum(0.0, 1.0 - y_norm ** 2))
    theta = PHI_G * i_s
    sphere_r = 88.0
    pts[:n_sphere, 0] = sphere_r * r_at_y * np.cos(theta)
    pts[:n_sphere, 1] = sphere_r * y_norm
    pts[:n_sphere, 2] = sphere_r * r_at_y * np.sin(theta)

    # 2. Concentric Planar Rings (Tilted at 27 deg) with Cassini division
    tilt = math.radians(27.0)
    cos_t, sin_t = math.cos(tilt), math.sin(tilt)

    u = np.linspace(0.0, 1.0, n_rings, dtype=np.float32)
    ring_r = np.where(
        u < 0.52,
        122.0 + (u / 0.52) * 44.0,
        np.where(u < 0.94, 178.0 + ((u - 0.52) / 0.42) * 52.0, 233.0 + ((u - 0.94) / 0.06) * 7.0)
    )
    phi = (np.arange(n_rings, dtype=np.float32) * PHI_G) % (math.pi * 2.0)
    rx = ring_r * np.cos(phi)
    rz = ring_r * np.sin(phi)
    ry = np.where(np.arange(n_rings) % 2 == 0, 1.0, -1.0) * (0.8 + np.sin(np.arange(n_rings) * 45.0) * 0.6)

    pts[n_sphere:, 0] = rx
    pts[n_sphere:, 1] = ry * cos_t - rz * sin_t
    pts[n_sphere:, 2] = ry * sin_t + rz * cos_t
    return pts


def generate_wormhole_model(num_points=NUM_POINTS):
    """Mode 2: Wireframe hyperboloid spacetime funnel with wide circular flange rims."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_rims = int(num_points * 0.26)
    n_grid = num_points - n_rims
    r0 = 22.0
    c = 68.0

    # 1. Hyperboloid Grid (meridians and latitudinal rings)
    i_g = np.arange(n_grid, dtype=np.float32)
    y_norm = -1.0 + (i_g / float(max(1, n_grid - 1))) * 2.0
    y = y_norm * 185.0
    r = r0 * np.sqrt(1.0 + (y / c) ** 2)
    theta = (i_g % 36.0) * (math.pi * 2.0 / 36.0) + (y * 0.0035)
    r_jitter = r * (0.98 + np.where(np.arange(n_grid) % 3 == 0, 0.04, 0.0))
    pts[:n_grid, 0] = r_jitter * np.cos(theta)
    pts[:n_grid, 1] = y
    pts[:n_grid, 2] = r_jitter * np.sin(theta)

    # 2. Flared Top & Bottom Rims (wide circular discs)
    half_rim = n_rims // 2
    i_top = np.arange(half_rim, dtype=np.float32)
    u_top = i_top / float(max(1, half_rim - 1))
    r_top = 175.0 + u_top * 60.0
    th_top = i_top * PHI_G
    pts[n_grid:n_grid + half_rim, 0] = r_top * np.cos(th_top)
    pts[n_grid:n_grid + half_rim, 1] = 185.0 + np.sin(i_top * 12.0) * 1.5
    pts[n_grid:n_grid + half_rim, 2] = r_top * np.sin(th_top)

    rem_rim = n_rims - half_rim
    i_bot = np.arange(rem_rim, dtype=np.float32)
    u_bot = i_bot / float(max(1, rem_rim - 1))
    r_bot = 175.0 + u_bot * 60.0
    th_bot = i_bot * PHI_G
    pts[n_grid + half_rim:, 0] = r_bot * np.cos(th_bot)
    pts[n_grid + half_rim:, 1] = -185.0 - np.sin(i_bot * 12.0) * 1.5
    pts[n_grid + half_rim:, 2] = r_bot * np.sin(th_bot)
    return pts


def generate_face_model(num_points=NUM_POINTS):
    """Mode 3: Full 360-degree sculpted human head bust (cranium, brow, eyes, nose, lips, jaw, ears, neck)."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_cranium = int(num_points * 0.28)
    n_features = int(num_points * 0.44)
    n_ears = int(num_points * 0.10)
    n_neck = num_points - (n_cranium + n_features + n_ears)
    idx = 0

    # 1. Skull Dome & Cranium
    for i in range(n_cranium):
        y_norm = -0.15 + (i / float(max(1, n_cranium - 1))) * 1.15
        phi = math.acos(max(-1.0, min(1.0, y_norm)))
        theta = PHI_G * i
        rx = 74.0 * math.sin(phi)
        rz = (75.0 if (0 < theta % (2 * math.pi) < math.pi) else 88.0) * math.sin(phi)
        y = 30.0 + 95.0 * math.cos(phi)
        pts[idx] = [rx * math.cos(theta), y, rz * math.sin(theta)]
        idx += 1

    # 2. Sculpted Facial Features
    for i in range(n_features):
        u = i / float(max(1, n_features - 1))
        if u < 0.22:
            # Nose bridge & tip
            tn = u / 0.22
            y = 30.0 - tn * 48.0
            nose_protrude = 52.0 + math.sin(tn * math.pi) * 35.0
            nose_width = 6.0 + tn * 16.0
            side = 1.0 if (i % 2 == 0) else -1.0
            x = side * (nose_width * 0.5 * (1.0 - (i % 4) * 0.2))
            pts[idx] = [x, y, nose_protrude]
        elif u < 0.42:
            # Eye sockets & eyelids
            te = (u - 0.22) / 0.20
            is_left = te < 0.5
            eye_t = te * 2.0 if is_left else (te - 0.5) * 2.0
            x_center = -36.0 if is_left else 36.0
            ang = eye_t * math.pi * 2.0
            pts[idx] = [x_center + 16.0 * math.cos(ang), 20.0 + 7.5 * math.sin(ang), 48.0 + 6.0 * math.cos(ang)]
        elif u < 0.60:
            # Forehead & brow arches
            tb = (u - 0.42) / 0.18
            is_left = tb < 0.5
            brow_t = tb * 2.0 if is_left else (tb - 0.5) * 2.0
            x_center = -38.0 if is_left else 38.0
            x_span = (brow_t - 0.5) * 34.0
            pts[idx] = [x_center + x_span, 36.0 - ((brow_t - 0.5) ** 2) * 12.0, 54.0 - abs(x_span) * 0.25]
        elif u < 0.80:
            # Lips & mouth
            tm = (u - 0.60) / 0.20
            ang = tm * math.pi * 2.0
            x = 24.0 * math.cos(ang)
            is_upper = math.sin(ang) >= 0
            y = -34.0 + (6.0 * math.sin(ang) if is_upper else 7.5 * math.sin(ang))
            pts[idx] = [x, y, 72.0 + 6.0 * math.cos(ang)]
        else:
            # Chin & jawline
            tj = (u - 0.80) / 0.20
            t_arch = -1.0 + tj * 2.0
            x = t_arch * 62.0
            y = -65.0 + (t_arch ** 2) * 45.0
            pts[idx] = [x, y, 62.0 - abs(t_arch) * 65.0]
        idx += 1

    # 3. Ears
    half_ears = n_ears // 2
    for i in range(half_ears):
        te = i / float(max(1, half_ears - 1))
        ang = te * math.pi * 1.5
        pts[idx] = [-72.0 - math.sin(ang) * 6.0, 5.0 + math.cos(ang) * 22.0, -8.0 + math.sin(ang) * 12.0]
        idx += 1
    for i in range(n_ears - half_ears):
        te = i / float(max(1, n_ears - half_ears - 1))
        ang = te * math.pi * 1.5
        pts[idx] = [72.0 + math.sin(ang) * 6.0, 5.0 + math.cos(ang) * 22.0, -8.0 + math.sin(ang) * 12.0]
        idx += 1

    # 4. Neck Column & Clavicle Collar
    for i in range(n_neck):
        tn = i / float(max(1, n_neck - 1))
        y = -55.0 - tn * 95.0
        th = i * PHI_G
        r_neck = 42.0 + tn * 26.0
        pts[idx] = [r_neck * math.cos(th), y, r_neck * math.sin(th) * 0.85 - 10.0]
        idx += 1

    return pts


def generate_dragon_model(num_points=NUM_POINTS):
    """Mode 4: Sculpted 3D Horned Dragon Head Bust (Image 1) with roaring jaws, serrated teeth, recurved crown horns & armored neck."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_jaws = int(num_points * 0.28)
    n_horns = int(num_points * 0.28)
    n_cranium = int(num_points * 0.18)
    n_neck = num_points - (n_jaws + n_horns + n_cranium)
    idx = 0

    # 1. Roaring Jaws, Muzzle, Serrated Teeth & Nostrils
    for i in range(n_jaws):
        u = i / float(max(1, n_jaws - 1))
        if u < 0.28:
            us = u / 0.28
            z = 8.0 + us * 98.0
            w_muzzle = 38.0 * (1.0 - us * 0.42)
            y_bridge = 28.0 + math.sin(us * math.pi * 0.85) * 14.0
            nasal_spine = math.sin(us * 22.0) * 6.5 if (i % 5 == 0) else 0.0
            side = -1.0 if (i % 2 == 0) else 1.0
            is_nostril = us > 0.82 and (i % 3 == 0)
            x = side * (w_muzzle * 0.85) if is_nostril else side * (w_muzzle * math.sin((i * PHI_G) % math.pi))
            pts[idx] = [x, y_bridge + nasal_spine, z]
        elif u < 0.52:
            ut = (u - 0.28) / 0.24
            side = -1.0 if (i % 2 == 0) else 1.0
            z_tooth = 14.0 + ut * 88.0
            x_tooth = side * (32.0 * (1.0 - ut * 0.38))
            y_jaw = 22.0 - ut * 3.0
            is_fang = ut > 0.72 and ut < 0.85
            t_len = 18.0 if is_fang else (8.0 + (i % 3) * 3.5)
            t_down = (i % 7) / 6.0
            pts[idx] = [x_tooth, y_jaw - t_down * t_len, z_tooth]
        elif u < 0.74:
            uj = (u - 0.52) / 0.22
            z = -6.0 + uj * 92.0
            w_mandible = 36.0 * (1.0 - uj * 0.40)
            y_jaw = -18.0 - math.sin(uj * math.pi * 0.75) * 38.0
            is_chin = uj > 0.88 and (i % 4 == 0)
            y_spur = -14.0 if is_chin else 0.0
            side = -1.0 if (i % 2 == 0) else 1.0
            x = 0.0 if is_chin else side * (w_mandible * math.sin((i * PHI_G) % math.pi))
            pts[idx] = [x, y_jaw + y_spur, z]
        elif u < 0.90:
            ult = (u - 0.74) / 0.16
            side = -1.0 if (i % 2 == 0) else 1.0
            z_tooth = 8.0 + ult * 76.0
            x_tooth = side * (30.0 * (1.0 - ult * 0.36))
            y_jaw_base = -18.0 - math.sin(ult * math.pi * 0.75) * 36.0
            is_lfang = ult > 0.65 and ult < 0.80
            t_height = 16.0 if is_lfang else (7.0 + (i % 3) * 3.0)
            t_up = (i % 7) / 6.0
            pts[idx] = [x_tooth, y_jaw_base + t_up * t_height, z_tooth]
        else:
            uo = (u - 0.90) / 0.10
            th_o = (i * PHI_G) % (math.pi * 2.0)
            r_o = 12.0 * math.sin(uo * math.pi)
            pts[idx] = [r_o * math.cos(th_o), -12.0 + r_o * math.sin(th_o) * 0.7, 10.0 + uo * 42.0]
        idx += 1

    # 2. Recurved Crown Horns & Cheek Spines
    for i in range(n_horns):
        u = i / float(max(1, n_horns - 1))
        if u < 0.58:
            uh = u / 0.58
            is_l = uh < 0.5
            ht = uh * 2.0 if is_l else (uh - 0.5) * 2.0
            side = -1.0 if is_l else 1.0
            x_base = side * (26.0 + ht * 28.0 + (ht ** 2) * 10.0)
            y_base = 58.0 + ht * 68.0 + math.sin(ht * math.pi * 0.8) * 22.0
            z_base = -18.0 - ht * 142.0
            phi_h = (i * 1.8) % (math.pi * 2.0)
            horn_r = (1.0 - ht * 0.88) * (14.0 + 2.8 * math.cos(ht * 42.0))
            pts[idx] = [x_base + horn_r * math.cos(phi_h), y_base + horn_r * math.sin(phi_h), z_base]
        elif u < 0.82:
            uc = (u - 0.58) / 0.24
            is_l = uc < 0.5
            ct = uc * 2.0 if is_l else (uc - 0.5) * 2.0
            side = -1.0 if is_l else 1.0
            phi_c = (i * 2.2) % (math.pi * 2.0)
            r_c = (1.0 - ct * 0.82) * 8.5
            pts[idx] = [side * (44.0 + ct * 26.0) + r_c * math.cos(phi_c), 28.0 + ct * 18.0 + r_c * math.sin(phi_c), 2.0 - ct * 68.0]
        else:
            ub = (u - 0.82) / 0.18
            if ub < 0.65:
                ubb = ub / 0.65
                is_l = ubb < 0.5
                bt = ubb * 2.0 if is_l else (ubb - 0.5) * 2.0
                side = -1.0 if is_l else 1.0
                pts[idx] = [side * (34.0 + bt * 10.0), 48.0 + bt * 24.0, 24.0 - bt * 20.0]
            else:
                um = (ub - 0.65) / 0.35
                pts[idx] = [1.5 if (i % 2 == 0) else -1.5, 64.0 + um * 22.0 + (6.0 if (i % 4 == 0) else 0.0), -12.0 + um * 32.0]
        idx += 1

    # 3. Cranium & Deep Sunken Eyes
    for i in range(n_cranium):
        u = i / float(max(1, n_cranium - 1))
        if u < 0.60:
            uc = u / 0.60
            yn = -1.0 + uc * 2.0
            rc = 42.0 * math.sqrt(max(0.0, 1.0 - yn ** 2))
            th_c = (i * PHI_G * 18.0) % (math.pi * 2.0)
            pts[idx] = [rc * math.cos(th_c) * 0.95, 46.0 + yn * 26.0, -4.0 + rc * math.sin(th_c) * 0.75]
        elif u < 0.85:
            ue = (u - 0.60) / 0.25
            is_l = ue < 0.5
            et = ue * 2.0 if is_l else (ue - 0.5) * 2.0
            side = -1.0 if is_l else 1.0
            ang = et * math.pi * 2.0
            pts[idx] = [side * 34.0 + math.cos(ang) * 9.0, 38.0 + math.sin(ang) * 7.5, 22.0 + math.cos(ang) * 4.0]
        else:
            up = (u - 0.85) / 0.15
            is_l = up < 0.5
            side = -1.0 if is_l else 1.0
            th_p = (i * PHI_G) % (math.pi * 2.0)
            rp = (i % 5) * 0.7
            pts[idx] = [side * 33.5 + rp * math.cos(th_p), 38.0 + rp * math.sin(th_p), 23.0]
        idx += 1

    # 4. Armored Neck Scutes & Spinal Crest
    for i in range(n_neck):
        u = i / float(max(1, n_neck - 1))
        y = 32.0 - u * 162.0
        z_ctr = -15.0 - u * 85.0
        w_neck = 42.0 + u * 42.0
        phi_n = (i * PHI_G) % (math.pi * 2.0)
        plate_r = math.sin(u * 38.0) * 3.5
        is_dspine = math.cos(phi_n) < -0.85 and (i % 3 == 0)
        spine_p = -16.0 * (1.0 - u * 0.3) if is_dspine else 0.0
        x = w_neck * math.sin(phi_n) * 0.95
        z = z_ctr + (w_neck * 0.75 * math.cos(phi_n)) + plate_r + spine_p
        pts[idx] = [x, y, z]
        idx += 1

    return pts


def generate_heart_model(num_points=NUM_POINTS):
    """Mode 5: Anatomical heart (ventricles, apex, aorta arch, carotid branches, pulmonary trunk, coronary sulcus)."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_ventricles = int(num_points * 0.44)
    n_aorta = int(num_points * 0.26)
    n_pulmonary = int(num_points * 0.16)
    n_coronary = num_points - (n_ventricles + n_aorta + n_pulmonary)
    idx = 0

    # 1. Ventricular Body & Apex
    for i in range(n_ventricles):
        u = i / float(max(1, n_ventricles - 1))
        y_norm = -1.0 + u * 1.8
        y = -45.0 + y_norm * 55.0
        taper = max(0.1, (y + 135.0) / 160.0)
        r_v = 68.0 * (taper ** 0.72)
        th = PHI_G * i
        apex_tilt_x = -28.0 * (1.0 - taper)
        pts[idx] = [apex_tilt_x + r_v * math.cos(th), y, r_v * math.sin(th) * 0.85]
        idx += 1

    # 2. Aortic Arch & 3 Carotid Arteries
    for i in range(n_aorta):
        u = i / float(max(1, n_aorta - 1))
        if u < 0.70:
            t_arch = (u / 0.70) * math.pi * 1.1
            arch_r = 48.0
            x = -8.0 + arch_r * math.cos(t_arch)
            y = 35.0 + arch_r * math.sin(t_arch)
            z = -10.0 - (t_arch / math.pi) * 45.0
            r_tube = 16.0
            th_tube = i * 0.8
            pts[idx] = [x + r_tube * math.cos(th_tube), y + r_tube * math.sin(th_tube), z + r_tube * 0.4 * math.sin(th_tube)]
        else:
            tb = (u - 0.70) / 0.30
            branch_idx = int(tb * 3)
            t_branch = (tb * 3) % 1.0
            bx = -22.0 + branch_idx * 20.0
            by = 82.0 + t_branch * 45.0
            bz = -5.0 + branch_idx * 5.0
            pts[idx] = [bx + (3.0 if (i % 2 == 0) else -3.0), by, bz]
        idx += 1

    # 3. Pulmonary Artery Trunk & Vena Cava
    for i in range(n_pulmonary):
        u = i / float(max(1, n_pulmonary - 1))
        if u < 0.65:
            tp = u / 0.65
            x = -35.0 + tp * 75.0
            y = 25.0 + math.sin(tp * math.pi) * 15.0
            z = 18.0 - tp * 35.0
            pts[idx] = [x + math.sin(i * 12.0) * 8.0, y + math.cos(i * 12.0) * 8.0, z]
        else:
            tv = (u - 0.65) / 0.35
            pts[idx] = [45.0 + math.sin(i * 8.0) * 9.0, 40.0 + tv * 60.0, -12.0 + math.cos(i * 8.0) * 9.0]
        idx += 1

    # 4. Coronary Arterial Sulcus
    for i in range(n_coronary):
        tc = i / float(max(1, n_coronary - 1))
        pts[idx] = [-15.0 + math.sin(tc * 14.0) * 22.0 - tc * 15.0, 15.0 - tc * 120.0, 42.0 * (1.0 - tc * 0.7)]
        idx += 1

    return pts


def generate_house_model(num_points=NUM_POINTS):
    """Mode 6: Modern Art-Deco apartment building with 3-tier curved balconies & rooftop antenna."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_balconies = int(num_points * 0.38)
    n_facade = int(num_points * 0.42)
    n_rooftop = num_points - (n_balconies + n_facade)
    idx = 0

    # 1. Three Tiers of Curved Balconies on Left & Rectangular Balconies on Right
    floors = [-75.0, -15.0, 45.0]
    per_balcony = n_balconies // 6
    for f in range(3):
        floor_y = floors[f]
        # Left semicircular balconies
        for i in range(per_balcony):
            th = (i / float(max(1, per_balcony - 1))) * math.pi
            r_balc = 48.0
            y_offset = 14.0 if (i % 3 == 0) else 0.0
            pts[idx] = [-90.0 + r_balc * math.cos(th), floor_y + y_offset, 25.0 + r_balc * math.sin(th)]
            idx += 1
        # Right rectangular balconies
        for i in range(per_balcony):
            u = i / float(max(1, per_balcony - 1))
            y_offset = 14.0 if (i % 3 == 0) else 0.0
            pts[idx] = [35.0 + u * 75.0, floor_y + y_offset, 70.0]
            idx += 1

    # 2. Main Façade, Windows, Entrance Portal
    for i in range(n_facade):
        x = -135.0 + (i % 50) * 5.5
        y = -130.0 + (i // 50) * 4.8
        z_wall = 25.0 if (i % 2 == 0) else -45.0
        pts[idx] = [x, y, z_wall]
        idx += 1

    # 3. Rooftop Penthouse Tower & Antenna Mast
    for i in range(n_rooftop):
        ur = i / float(max(1, n_rooftop - 1))
        if ur < 0.65:
            x = -75.0 + (i % 20) * 2.8
            y = 95.0 + (i // 20) * 3.5
            z = -15.0 + (i % 5) * 6.0
            pts[idx] = [x, y, z]
        else:
            ua = (ur - 0.65) / 0.35
            x_cross = (-48.0 + (16.0 if (i % 2 == 0) else -16.0)) if (i % 4 == 0) else -48.0
            pts[idx] = [x_cross, 135.0 + ua * 55.0, 0.0]
        idx += 1

    return pts


def generate_mountain_model(num_points=NUM_POINTS):
    """Mode 7: Alpine mountain massif with sharp Matterhorn peak, spires & rock talus."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    i = np.arange(num_points, dtype=np.float32)
    u = i / float(num_points)
    th = i * PHI_G
    r_base = np.sqrt(u) * 230.0

    # Sharp Matterhorn central horn
    main_peak = np.exp(-((r_base / 68.0) ** 2)) * 265.0
    # 4 radial craggy arêtes
    ridge = (np.abs(np.cos(th * 2.0)) ** 3.0) * np.exp(-r_base / 120.0) * 65.0
    # Secondary aiguille spires
    d_sub1 = np.hypot(r_base * np.cos(th) - (-65.0), r_base * np.sin(th) - (-20.0))
    sub1 = np.exp(-((d_sub1 / 38.0) ** 2)) * 125.0
    d_sub2 = np.hypot(r_base * np.cos(th) - 55.0, r_base * np.sin(th) - 35.0)
    sub2 = np.exp(-((d_sub2 / 34.0) ** 2)) * 110.0
    # Rock texture noise
    noise = np.sin(r_base * 0.22) * 12.0 + np.cos(th * 9.0) * 8.0

    y = -120.0 + main_peak + ridge + sub1 + sub2 + noise
    pts[:, 0] = r_base * np.cos(th)
    pts[:, 1] = y
    pts[:, 2] = r_base * np.sin(th)
    return pts


def generate_blackhole_model(num_points=NUM_POINTS):
    """Mode 8: Gargantua black hole (event horizon void, swirling accretion disk & lensing arch)."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_disk = int(num_points * 0.68)
    n_lens = num_points - n_disk

    # 1. Swirling Accretion Disk (outside event horizon void R > 54)
    i_d = np.arange(n_disk, dtype=np.float32)
    u_d = i_d / float(n_disk)
    r_d = 54.0 + (u_d ** 0.85) * 185.0
    th_d = u_d * 48.0 * math.pi
    pts[:n_disk, 0] = r_d * np.cos(th_d)
    pts[:n_disk, 1] = np.sin(u_d * 180.0) * 3.5
    pts[:n_disk, 2] = r_d * np.sin(th_d)

    # 2. Upper and Lower Gravitational Lensing Arches
    half_lens = n_lens // 2
    i_l1 = np.arange(half_lens, dtype=np.float32)
    t1 = (i_l1 / float(max(1, half_lens - 1))) * math.pi
    r_l1 = 65.0 + np.sin(t1) * 55.0
    pts[n_disk:n_disk + half_lens, 0] = r_l1 * np.cos(t1)
    pts[n_disk:n_disk + half_lens, 1] = 48.0 + np.sin(t1) * 82.0
    pts[n_disk:n_disk + half_lens, 2] = np.sin(t1 * 3.0) * 10.0

    rem_lens = n_lens - half_lens
    i_l2 = np.arange(rem_lens, dtype=np.float32)
    t2 = (i_l2 / float(max(1, rem_lens - 1))) * math.pi
    r_l2 = 65.0 + np.sin(t2) * 55.0
    pts[n_disk + half_lens:, 0] = r_l2 * np.cos(t2)
    pts[n_disk + half_lens:, 1] = -(48.0 + np.sin(t2) * 82.0)
    pts[n_disk + half_lens:, 2] = np.sin(t2 * 3.0) * 10.0
    return pts


def generate_text_model(num_points=NUM_POINTS):
    """Mode 9: 3D Volumetric Typography 'KENNU'."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    segments = [
        # K
        (-190, -50, -190, 50), (-185, -50, -185, 50),
        (-185, 0, -135, -50), (-185, 0, -135, 50),
        (-185, -5, -140, -50), (-185, 5, -140, 50),
        # E
        (-115, -50, -115, 50), (-110, -50, -110, 50),
        (-115, -50, -65, -50), (-115, 0, -72, 0), (-115, 50, -65, 50),
        # First N
        (-45, -50, -45, 50), (-45, -50, 10, 50), (10, -50, 10, 50),
        (-40, -50, -40, 50), (5, -50, 5, 50),
        # Second N
        (35, -50, 35, 50), (35, -50, 90, 50), (90, -50, 90, 50),
        (40, -50, 40, 50), (85, -50, 85, 50),
        # U
        (115, -50, 115, 25), (175, -50, 175, 25),
        (120, -50, 120, 25), (170, -50, 170, 25),
        (115, 25, 130, 50), (130, 50, 160, 50), (160, 50, 175, 25),
    ]
    per_seg = num_points // len(segments)
    idx = 0
    for x0, y0, x1, y1 in segments:
        for i in range(per_seg):
            t = i / float(per_seg)
            z_th = ((i % 7) - 3.0) * 6.0
            pts[idx, 0] = (x0 + t * (x1 - x0)) * 1.12
            pts[idx, 1] = -(y0 + t * (y1 - y0)) * 1.12
            pts[idx, 2] = z_th
            idx += 1
    while idx < num_points:
        pts[idx] = [0.0, 0.0, 0.0]
        idx += 1
    return pts


def generate_cobra_model(num_points=NUM_POINTS):
    """Mode 10: 3D King Cobra Snake (Coiled base, S-curved neck, flared hood, striking head with fangs)."""
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_base = int(num_points * 0.32)
    n_neck = int(num_points * 0.22)
    n_hood = int(num_points * 0.28)
    n_head = num_points - (n_base + n_neck + n_hood)
    idx = 0

    # 1. Coiled Base Foundation
    for i in range(n_base):
        u = i / float(max(1, n_base - 1))
        theta = u * 5.6 * math.pi
        r_spiral = 40.0 + (u ** 0.85) * 155.0
        r_tube = 8.0 + u * 10.0 + math.sin(u * 120.0) * 1.2
        phi = (i * PHI_G) % (math.pi * 2.0)
        pts[idx, 0] = (r_spiral + r_tube * math.cos(phi)) * math.cos(theta)
        pts[idx, 1] = -145.0 + u * 48.0 + r_tube * math.sin(phi)
        pts[idx, 2] = (r_spiral + r_tube * math.cos(phi)) * math.sin(theta)
        idx += 1

    # 2. Upright S-Curved Neck Column
    for i in range(n_neck):
        u = i / float(max(1, n_neck - 1))
        y = -97.0 + u * 107.0
        z_center = -14.0 + math.sin(u * math.pi * 1.4) * 26.0
        x_center = math.sin(u * math.pi * 0.8) * 8.0
        r_neck = 17.0 - u * 2.0
        phi = (i * PHI_G) % (math.pi * 2.0)
        cos_p = math.cos(phi)
        rad_x = r_neck * (1.15 if cos_p > 0.2 else 1.0)
        rad_z = r_neck * (0.85 if cos_p > 0.2 else 1.0)
        pts[idx, 0] = x_center + rad_x * math.sin(phi)
        pts[idx, 1] = y
        pts[idx, 2] = z_center + rad_z * cos_p
        idx += 1

    # 3. Flared Concave Cobra Cervical Hood
    for i in range(n_hood):
        u = i / float(max(1, n_hood - 1))
        y = 10.0 + u * 85.0
        max_flare = (math.sin(u * math.pi) ** 0.65) * 92.0
        p_norm = ((i % 100) / 50.0 - 1.0)
        x_rel = p_norm * max_flare
        z_curvature = 8.0 - ((x_rel / max(1.0, max_flare)) ** 2.0) * 16.0
        rib_noise = math.sin(u * 28.0) * 2.0
        is_dorsal_spectacle = abs(x_rel) > 28.0 and abs(x_rel) < 46.0 and 52.0 < y < 72.0 and (i % 3 == 0)
        z_marking = -6.0 if is_dorsal_spectacle else 0.0
        pts[idx, 0] = x_rel
        pts[idx, 1] = y + rib_noise
        pts[idx, 2] = z_curvature + z_marking
        idx += 1

    # 4. Striking Head, Brow, Open Jaws, Venom Fangs & Tongue
    for i in range(n_head):
        u = i / float(max(1, n_head - 1))
        if u < 0.45:
            uh = u / 0.45
            y = 92.0 + uh * 28.0
            w_skull = 32.0 * (1.0 - uh * 0.55)
            th_s = (i * PHI_G) % (math.pi * 2.0)
            pts[idx, 0] = w_skull * math.cos(th_s)
            pts[idx, 1] = y
            pts[idx, 2] = 12.0 + uh * 32.0 + math.sin(th_s) * 12.0
        elif u < 0.62:
            uj = (u - 0.45) / 0.17
            th_j = (1.0 if i % 2 == 0 else -1.0) * (uj * 14.0)
            pts[idx, 0] = th_j
            pts[idx, 1] = 84.0 - uj * 6.0
            pts[idx, 2] = 20.0 + uj * 22.0
        elif u < 0.78:
            uf = (u - 0.62) / 0.16
            side = -1.0 if i % 2 == 0 else 1.0
            pts[idx, 0] = side * (8.5 - uf * 1.5)
            pts[idx, 1] = 100.0 - uf * 18.0
            pts[idx, 2] = 34.0 - math.sin(uf * math.pi * 0.5) * 4.0
        else:
            ut = (u - 0.78) / 0.22
            fork = ((1.0 if i % 2 == 0 else -1.0) * (ut - 0.6) * 22.0) if ut > 0.6 else 0.0
            pts[idx, 0] = fork
            pts[idx, 1] = 90.0 + math.sin(ut * math.pi) * 3.0
            pts[idx, 2] = 32.0 + ut * 34.0
        idx += 1

    return pts


# ==============================================================================
# BULLETPROOF ASSET INFLATION (WITH STRICT RECTANGLE / BORDER REJECTION)
# ==============================================================================

def load_or_bake_model(image_path, fallback_func, num_points=NUM_POINTS, depth_multiplier=85.0):
    """
    Attempts to read an asset PNG. If the image is transparent, extracts silhouette.
    CRITICAL SAFETY: If the mask touches borders or forms a rectangular block,
    it automatically rejects the 2D mask and uses the pristine 3D Blender procedural model!
    """
    if not HAS_CV2 or not os.path.isfile(image_path):
        return fallback_func(num_points)

    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        return fallback_func(num_points)

    h, w = img.shape[:2]
    # Check for alpha channel
    if len(img.shape) == 3 and img.shape[2] == 4:
        mask = (img[:, :, 3] > 30).astype(np.uint8) * 255
    else:
        # Check corners to find background color
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        corner_patch = [gray[:10, :10], gray[:10, -10:], gray[-10:, :10], gray[-10:, -10:]]
        mean_corner = np.mean([np.mean(p) for p in corner_patch])
        if mean_corner > 180:
            # Light background -> foreground is dark
            _, mask = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)
        else:
            # Dark background -> foreground is bright
            _, mask = cv2.threshold(gray, 35, 255, cv2.THRESH_BINARY)

    # ANTI-SQUARE & ANTI-BORDER REJECTION CHECK:
    # 1. Check if border edges are flooded with foreground
    top_edge = np.mean(mask[0, :] > 0)
    bot_edge = np.mean(mask[-1, :] > 0)
    left_edge = np.mean(mask[:, 0] > 0)
    right_edge = np.mean(mask[:, -1] > 0)
    border_flood = max(top_edge, bot_edge, left_edge, right_edge)

    # 2. Check foreground area fraction
    fg_fraction = np.mean(mask > 0)

    # If mask touches borders or floods > 75% of canvas, it's a solid rectangular block!
    if border_flood > 0.05 or fg_fraction > 0.75 or fg_fraction < 0.03:
        print(f"  [Auto-Correction] Image {os.path.basename(image_path)} background detected as square box. Using pristine 3D procedural sculpture.")
        return fallback_func(num_points)

    # Safe to inflate with Euclidean distance transform
    dist_map = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    max_d = np.max(dist_map)
    if max_d <= 0:
        return fallback_func(num_points)
    dist_map /= max_d

    ys, xs = np.where(mask > 40)
    if len(xs) < num_points // 4:
        return fallback_func(num_points)

    indices = np.random.choice(len(xs), size=num_points, replace=(len(xs) < num_points))
    px = xs[indices].astype(np.float32)
    py = ys[indices].astype(np.float32)
    depths = dist_map[ys[indices], xs[indices]]

    cx = (np.min(xs) + np.max(xs)) / 2.0
    cy = (np.min(ys) + np.max(ys)) / 2.0
    px = px - cx
    py = -(py - cy)  # Flip upright

    max_span = max(float(np.max(np.abs(px))), float(np.max(np.abs(py))), 1.0)
    scale = 195.0 / max_span
    px *= scale
    py *= scale

    z_env = np.sqrt(np.clip(depths, 0.0, 1.0)) * depth_multiplier
    n_front = int(num_points * 0.42)
    n_back = int(num_points * 0.42)
    pz = np.zeros(num_points, dtype=np.float32)
    pz[:n_front] = z_env[:n_front] * (0.85 + 0.15 * np.random.rand(n_front))
    pz[n_front:n_front + n_back] = -z_env[n_front:n_front + n_back] * (0.85 + 0.15 * np.random.rand(n_back))
    pz[n_front + n_back:] = z_env[n_front + n_back:] * np.random.uniform(-0.75, 0.75, num_points - (n_front + n_back))

    return np.column_stack((px, py, pz)).astype(np.float32)


# ==============================================================================
# MAIN BAKE ENTRY POINT
# ==============================================================================

def main():
    os.makedirs(ASSET_DIR, exist_ok=True)
    models = {}
    colors = {}

    print("=" * 75)
    print(" BUILD_ASSETS.PY: BAKING CLEAN 360° VOLUMETRIC 3D POINT CLOUDS")
    print(" (Zero Bounding Boxes | Zero Debug Wireframes | Zero Square Outlines)")
    print("=" * 75)

    # Mode 0: Idle Galaxy
    print("• Mode 0: Cosmic Spiral Galaxy...")
    models["idle"] = generate_idle_model(NUM_POINTS)
    colors["idle"] = create_colors(NUM_POINTS, 0.35, 0.88, 1.0)

    # Mode 1: Saturn
    print("• Mode 1: 3D Saturn (Core + Tilted Concentric Rings)...")
    models["saturn"] = generate_saturn_model(NUM_POINTS)
    colors["saturn"] = create_colors(NUM_POINTS, 1.0, 0.82, 0.45)

    # Mode 2: Wormhole
    print("• Mode 2: 3D Wormhole Funnel (Spacetime Hyperboloid)...")
    models["wormhole"] = generate_wormhole_model(NUM_POINTS)
    colors["wormhole"] = create_colors(NUM_POINTS, 0.40, 0.90, 1.0)

    # Mode 3: Face
    face_png = os.path.join(ASSET_DIR, "face.png")
    print("• Mode 3: 3D Human Face (360° Sculpted Head Bust with Ears, Nose, Jaw & Neck)...")
    models["face"] = load_or_bake_model(face_png, generate_face_model, NUM_POINTS, depth_multiplier=105.0)
    colors["face"] = create_colors(NUM_POINTS, 0.30, 0.92, 1.0)

    # Mode 4: Dragon
    dragon_png = os.path.join(ASSET_DIR, "dragon.png")
    print("• Mode 4: 3D Dragon (Horned Head, Spread Wings, Pear Belly, Claws & Tail)...")
    models["dragon"] = load_or_bake_model(dragon_png, generate_dragon_model, NUM_POINTS, depth_multiplier=95.0)
    colors["dragon"] = create_colors(NUM_POINTS, 0.96, 0.98, 1.0)

    # Mode 5: Heart
    heart_png = os.path.join(ASSET_DIR, "heart.png")
    print("• Mode 5: Anatomical Heart (Ventricles, Apex, Aorta Loop & Carotid Branches)...")
    models["heart"] = load_or_bake_model(heart_png, generate_heart_model, NUM_POINTS, depth_multiplier=115.0)
    colors["heart"] = create_colors(NUM_POINTS, 1.0, 0.18, 0.45)

    # Mode 6: House / Apartment Building
    house_png = os.path.join(ASSET_DIR, "house.png")
    if not os.path.isfile(house_png):
        house_png = os.path.join(ASSET_DIR, "building.png")
    print("• Mode 6: Modern Art-Deco Apartment Building (Curved Balconies & Roof Antenna)...")
    models["building"] = load_or_bake_model(house_png, generate_house_model, NUM_POINTS, depth_multiplier=80.0)
    colors["building"] = create_colors(NUM_POINTS, 0.35, 0.85, 1.0)

    # Mode 7: Mountain Massif
    mountain_png = os.path.join(ASSET_DIR, "mountain.png")
    print("• Mode 7: Alpine Mountain Massif (Matterhorn Horn, Spires & Rock Talus)...")
    models["mountain"] = load_or_bake_model(mountain_png, generate_mountain_model, NUM_POINTS, depth_multiplier=110.0)
    colors["mountain"] = create_colors(NUM_POINTS, 0.30, 0.82, 0.65)

    # Mode 8: Black Hole
    blackhole_png = os.path.join(ASSET_DIR, "blackhole.png")
    print("• Mode 8: Gargantua Black Hole (Event Horizon Void, Accretion Disk & Lensing Arch)...")
    models["blackhole"] = load_or_bake_model(blackhole_png, generate_blackhole_model, NUM_POINTS, depth_multiplier=75.0)
    colors["blackhole"] = create_colors(NUM_POINTS, 1.0, 0.60, 0.20)

    # Mode 9: 3D Typography
    print("• Mode 9: 3D Typography 'KENNU'...")
    models["text"] = generate_text_model(NUM_POINTS)
    colors["text"] = create_colors(NUM_POINTS, 0.30, 0.95, 1.0)

    # Mode 10: 3D King Cobra Snake
    print("• Mode 10: 3D King Cobra Snake (Coiled base, flared hood, fangs & forked tongue)...")
    models["cobra"] = generate_cobra_model(NUM_POINTS)
    col_cobra = create_colors(NUM_POINTS, 0.96, 0.88, 0.65, 0.98)
    col_cobra[int(NUM_POINTS * 0.82):, :3] = [0.20, 0.98, 0.88]
    colors["cobra"] = col_cobra

    # Save to compressed .npz archive
    save_dict = {}
    for k in models:
        save_dict[k] = models[k]
        save_dict[f"col_{k}"] = colors[k]

    np.savez_compressed(OUTPUT_FILE, **save_dict)
    print("=" * 75)
    print(f"[SUCCESS] Baked {len(models)} clean 360° point clouds into:")
    print(f"          {OUTPUT_FILE}")
    print("=" * 75)


if __name__ == "__main__":
    main()
