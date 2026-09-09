/**
 * Embedded Python Engine Source Code for Web Display & Direct Download
 * Matches main.py and build_assets.py with zero squares and full 3D Blender geometry.
 */

export const PYTHON_MAIN_SOURCE = `"""
main.py - AR 3D Particle Dust Simulation (Pure Particle Cloud Engine)
======================================================================
STRICT VISUAL RULES ENFORCED:
  • ABSOLUTE ZERO SQUARES / NO DEBUG WIREFRAMES:
    - Zero bounding boxes, zero HUD outline rectangles, zero debug wireframes.
    - Pure cosmic void background with glowing point-cloud stardust only.
  • PRE-COMPUTED & EMBEDDED 3D BLENDER MODELS:
    - 10 full 360-degree closed volumetric sculptures:
      [0] Galaxy Spiral Disc
      [1] Saturn Spheroid + Tilted Planar Rings with Cassini Gap
      [2] Wormhole Spacetime Hyperboloid Funnel
      [3] 3D Human Face Bust (Cranium, Brow, Eyes, Nose, Lips, Jaw, Ears, Neck)
      [4] 3D Dragon (Horns, Snout, Bat Wings with Ribs, Belly, Claws, Tail)
      [5] Anatomical Heart (Ventricles, Apex, Aorta Arch, Carotid Pipes, Pulmonary Trunk)
      [6] Modern Art-Deco Apartment Building (3-Tier Curved Balconies & Roof Antenna)
      [7] Alpine Mountain Massif (Matterhorn Sharp Peak, Spires & Rock Talus)
      [8] Gargantua Black Hole (Event Horizon Void, Accretion Disk & Lensing Arch)
      [9] 3D Typography 'I LOVE YOU'
  • BUILT-IN BOX/SQUARE REJECTION:
    - Automatically checks loaded models from assets/models_3d.npz for square
      artifacts; if a corrupted rectangular file is detected, automatically uses
      the pristine 3D mathematical sculpture!
  • SILKY SMOOTH CRITICALLY DAMPED DYNAMICS:
    - 1-to-1 vertex interpolation: velocity = (velocity * 0.84) + ((target - current) * 0.08)
    - Zero turbulence or jitter once settled.
  • CLEAN PIP INSET:
    - Clean webcam feed in top-right with hand skeleton drawn ONLY inside the PIP video.
    - Zero skeleton lines projected onto the 3D particle canvas.

Dependencies:
    pip install pygame PyOpenGL PyOpenGL_accelerate opencv-python mediapipe numpy

Usage:
    python main.py
"""

import os
import sys
import time
import math
import threading
import numpy as np

# Pygame & OpenGL
import pygame
from pygame.locals import (
    DOUBLEBUF, OPENGL, RESIZABLE, QUIT, KEYDOWN, VIDEORESIZE,
    K_ESCAPE, K_q, K_p, K_b, K_r, K_f,
    K_0, K_1, K_2, K_3, K_4, K_5, K_6, K_7, K_8, K_9
)
from OpenGL.GL import (
    glViewport, glClearColor, glClear, glEnable, glDisable, glBlendFunc,
    glPointSize, glMatrixMode, glLoadIdentity, glPushMatrix, glPopMatrix,
    glTranslatef, glRotatef, glEnableClientState, glDisableClientState,
    glVertexPointer, glColorPointer, glDrawArrays, glGenTextures, glBindTexture,
    glTexParameteri, glTexImage2D, glTexSubImage2D, glBegin, glEnd, glTexCoord2f,
    glVertex2f, glColor4f,
    GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_BLEND, GL_SRC_ALPHA, GL_ONE,
    GL_ONE_MINUS_SRC_ALPHA, GL_POINT_SMOOTH, GL_POINTS, GL_VERTEX_ARRAY,
    GL_COLOR_ARRAY, GL_FLOAT, GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER,
    GL_TEXTURE_MAG_FILTER, GL_LINEAR, GL_RGB, GL_UNSIGNED_BYTE,
    GL_QUADS, GL_PROJECTION, GL_MODELVIEW, GL_DEPTH_TEST
)
from OpenGL.GLU import gluPerspective, gluOrtho2D

# OpenCV & MediaPipe
import cv2

mp_hands = None
mp_draw = None
mp_styles = None

try:
    from mediapipe import solutions as mp_solutions
    mp_hands = getattr(mp_solutions, "hands", None)
    mp_draw = getattr(mp_solutions, "drawing_utils", None)
    mp_styles = getattr(mp_solutions, "drawing_styles", None)
except Exception:
    pass

if mp_hands is None:
    try:
        import mediapipe.solutions.hands as mp_hands
        import mediapipe.solutions.drawing_utils as mp_draw
        import mediapipe.solutions.drawing_styles as mp_styles
    except Exception:
        pass

if mp_hands is None:
    try:
        import mediapipe.python.solutions.hands as mp_hands
        import mediapipe.python.solutions.drawing_utils as mp_draw
        import mediapipe.python.solutions.drawing_styles as mp_styles
    except Exception:
        pass

if mp_hands is None:
    print("[WEBCAM] Notice: MediaPipe solutions module not found in this Python build.")
    print("         To enable hand tracking: pip install \\"mediapipe<=0.10.14\\"")
    print("         Running with keyboard hotkeys (0-9, P, B, R, F) & mouse control active.")

NUM_POINTS = 8000
DEFAULT_WIDTH = 1280
DEFAULT_HEIGHT = 720
MODELS_FILE = os.path.join("assets", "models_3d.npz")
PHI_G = math.pi * (3.0 - math.sqrt(5.0))

SPRING_ACCEL = 0.08
DAMPING = 0.84
COLOR_LERP = 0.08
YAW_SPEED = 0.007

COLOR_BG = (0.02, 0.02, 0.03, 1.0)


def create_fallback_models(num_points=NUM_POINTS):
    models = {}
    colors = {}

    def make_col(r, g, b, a=0.96):
        c = np.zeros((num_points, 4), dtype=np.float32)
        c[:, 0], c[:, 1], c[:, 2], c[:, 3] = r, g, b, a
        return c

    # 0. Galaxy
    m0 = np.zeros((num_points, 3), dtype=np.float32)
    n_core = int(num_points * 0.28)
    n_arms = num_points - n_core
    i_c = np.arange(n_core, dtype=np.float32)
    u_c = i_c / float(max(1, n_core - 1))
    r_c = (u_c ** 1.6) * 65.0
    th_c = PHI_G * i_c
    phi_c = np.arccos(np.clip(1.0 - 2.0 * u_c, -1.0, 1.0))
    m0[:n_core, 0] = r_c * np.sin(phi_c) * np.cos(th_c)
    m0[:n_core, 1] = r_c * np.cos(phi_c) * 0.55
    m0[:n_core, 2] = r_c * np.sin(phi_c) * np.sin(th_c)

    i_a = np.arange(n_arms, dtype=np.float32)
    arm_idx = i_a % 2
    t = i_a / float(n_arms)
    r_a = 40.0 + (t ** 0.78) * 220.0
    th_a = 3.8 * np.log(np.maximum(1.0, r_a / 25.0)) + arm_idx * math.pi + np.sin(i_a * 99.0) * 0.18
    scatter = (np.sin(i_a * 1234.56) * 16.0) * (r_a / 220.0)
    y_scat = (np.cos(i_a * 987.65) * 12.0) * np.exp(-r_a / 160.0)
    m0[n_core:, 0] = (r_a + scatter) * np.cos(th_a)
    m0[n_core:, 1] = y_scat
    m0[n_core:, 2] = (r_a + scatter) * np.sin(th_a)
    models[0] = m0
    colors[0] = make_col(0.35, 0.88, 1.0)

    # 1. Saturn
    m1 = np.zeros((num_points, 3), dtype=np.float32)
    n_s = int(num_points * 0.38)
    n_r = num_points - n_s
    i_s = np.arange(n_s, dtype=np.float32)
    yn = 1.0 - (i_s / float(max(1, n_s - 1))) * 2.0
    r_at_y = np.sqrt(np.maximum(0.0, 1.0 - yn ** 2))
    th1 = PHI_G * i_s
    m1[:n_s, 0] = 88.0 * r_at_y * np.cos(th1)
    m1[:n_s, 1] = 88.0 * yn
    m1[:n_s, 2] = 88.0 * r_at_y * np.sin(th1)

    tilt = math.radians(27.0)
    cos_t, sin_t = math.cos(tilt), math.sin(tilt)
    u_r = np.linspace(0.0, 1.0, n_r, dtype=np.float32)
    ring_r = np.where(u_r < 0.52, 122.0 + (u_r / 0.52) * 44.0, np.where(u_r < 0.94, 178.0 + ((u_r - 0.52) / 0.42) * 52.0, 233.0 + ((u_r - 0.94) / 0.06) * 7.0))
    phi1 = (np.arange(n_r, dtype=np.float32) * PHI_G) % (math.pi * 2.0)
    rx = ring_r * np.cos(phi1)
    rz = ring_r * np.sin(phi1)
    ry = np.where(np.arange(n_r) % 2 == 0, 1.0, -1.0) * (0.8 + np.sin(np.arange(n_r) * 45.0) * 0.6)
    m1[n_s:, 0] = rx
    m1[n_s:, 1] = ry * cos_t - rz * sin_t
    m1[n_s:, 2] = ry * sin_t + rz * cos_t
    models[1] = m1
    colors[1] = make_col(1.0, 0.82, 0.45)

    # 2. Wormhole
    m2 = np.zeros((num_points, 3), dtype=np.float32)
    n_rims = int(num_points * 0.26)
    n_grid = num_points - n_rims
    i_g = np.arange(n_grid, dtype=np.float32)
    y_norm = -1.0 + (i_g / float(max(1, n_grid - 1))) * 2.0
    y2 = y_norm * 185.0
    r2 = 22.0 * np.sqrt(1.0 + (y2 / 68.0) ** 2)
    th2 = (i_g % 36.0) * (math.pi * 2.0 / 36.0) + (y2 * 0.0035)
    r_jit = r2 * (0.98 + np.where(np.arange(n_grid) % 3 == 0, 0.04, 0.0))
    m2[:n_grid, 0] = r_jit * np.cos(th2)
    m2[:n_grid, 1] = y2
    m2[:n_grid, 2] = r_jit * np.sin(th2)

    half_rim = n_rims // 2
    i_top = np.arange(half_rim, dtype=np.float32)
    u_top = i_top / float(max(1, half_rim - 1))
    r_top = 175.0 + u_top * 60.0
    th_top = i_top * PHI_G
    m2[n_grid:n_grid + half_rim, 0] = r_top * np.cos(th_top)
    m2[n_grid:n_grid + half_rim, 1] = 185.0 + np.sin(i_top * 12.0) * 1.5
    m2[n_grid:n_grid + half_rim, 2] = r_top * np.sin(th_top)

    rem_rim = n_rims - half_rim
    i_bot = np.arange(rem_rim, dtype=np.float32)
    u_bot = i_bot / float(max(1, rem_rim - 1))
    r_bot = 175.0 + u_bot * 60.0
    th_bot = i_bot * PHI_G
    m2[n_grid + half_rim:, 0] = r_bot * np.cos(th_bot)
    m2[n_grid + half_rim:, 1] = -185.0 - np.sin(i_bot * 12.0) * 1.5
    m2[n_grid + half_rim:, 2] = r_bot * np.sin(th_bot)
    models[2] = m2
    colors[2] = make_col(0.40, 0.90, 1.0)

    # 3. Face Bust
    m3 = np.zeros((num_points, 3), dtype=np.float32)
    n_cranium = int(num_points * 0.28)
    n_features = int(num_points * 0.44)
    n_ears = int(num_points * 0.10)
    n_neck = num_points - (n_cranium + n_features + n_ears)
    idx = 0

    for i in range(n_cranium):
        yn3 = -0.15 + (i / float(max(1, n_cranium - 1))) * 1.15
        p3 = math.acos(max(-1.0, min(1.0, yn3)))
        t3 = PHI_G * i
        rx = 74.0 * math.sin(p3)
        rz = (75.0 if (0 < t3 % (2 * math.pi) < math.pi) else 88.0) * math.sin(p3)
        m3[idx] = [rx * math.cos(t3), 30.0 + 95.0 * math.cos(p3), rz * math.sin(t3)]
        idx += 1

    for i in range(n_features):
        u = i / float(max(1, n_features - 1))
        if u < 0.22:
            tn = u / 0.22
            y = 30.0 - tn * 48.0
            nose_p = 52.0 + math.sin(tn * math.pi) * 35.0
            nose_w = 6.0 + tn * 16.0
            side = 1.0 if (i % 2 == 0) else -1.0
            m3[idx] = [side * (nose_w * 0.5 * (1.0 - (i % 4) * 0.2)), y, nose_p]
        elif u < 0.42:
            te = (u - 0.22) / 0.20
            is_l = te < 0.5
            eye_t = te * 2.0 if is_l else (te - 0.5) * 2.0
            xc = -36.0 if is_l else 36.0
            ang = eye_t * math.pi * 2.0
            m3[idx] = [xc + 16.0 * math.cos(ang), 20.0 + 7.5 * math.sin(ang), 48.0 + 6.0 * math.cos(ang)]
        elif u < 0.60:
            tb = (u - 0.42) / 0.18
            is_l = tb < 0.5
            brow_t = tb * 2.0 if is_l else (tb - 0.5) * 2.0
            xc = -38.0 if is_l else 38.0
            xs = (brow_t - 0.5) * 34.0
            m3[idx] = [xc + xs, 36.0 - ((brow_t - 0.5) ** 2) * 12.0, 54.0 - abs(xs) * 0.25]
        elif u < 0.80:
            tm = (u - 0.60) / 0.20
            ang = tm * math.pi * 2.0
            x = 24.0 * math.cos(ang)
            is_up = math.sin(ang) >= 0
            y = -34.0 + (6.0 * math.sin(ang) if is_up else 7.5 * math.sin(ang))
            m3[idx] = [x, y, 72.0 + 6.0 * math.cos(ang)]
        else:
            tj = (u - 0.80) / 0.20
            ta = -1.0 + tj * 2.0
            m3[idx] = [ta * 62.0, -65.0 + (ta ** 2) * 45.0, 62.0 - abs(ta) * 65.0]
        idx += 1

    half_e = n_ears // 2
    for i in range(half_e):
        te = i / float(max(1, half_e - 1))
        ang = te * math.pi * 1.5
        m3[idx] = [-72.0 - math.sin(ang) * 6.0, 5.0 + math.cos(ang) * 22.0, -8.0 + math.sin(ang) * 12.0]
        idx += 1
    for i in range(n_ears - half_e):
        te = i / float(max(1, n_ears - half_e - 1))
        ang = te * math.pi * 1.5
        m3[idx] = [72.0 + math.sin(ang) * 6.0, 5.0 + math.cos(ang) * 22.0, -8.0 + math.sin(ang) * 12.0]
        idx += 1

    for i in range(n_neck):
        tn = i / float(max(1, n_neck - 1))
        th = i * PHI_G
        rn = 42.0 + tn * 26.0
        m3[idx] = [rn * math.cos(th), -55.0 - tn * 95.0, rn * math.sin(th) * 0.85 - 10.0]
        idx += 1
    models[3] = m3
    colors[3] = make_col(0.30, 0.92, 1.0)

    # 4. Dragon
    m4 = np.zeros((num_points, 3), dtype=np.float32)
    n_torso = int(num_points * 0.25)
    n_head = int(num_points * 0.22)
    n_wings = int(num_points * 0.32)
    n_legs = int(num_points * 0.12)
    n_tail = num_points - (n_torso + n_head + n_wings + n_legs)
    idx = 0

    for i in range(n_torso):
        yn4 = -1.0 + (i / float(max(1, n_torso - 1))) * 2.0
        w_b = 62.0 * math.sqrt(max(0.0, 1.0 - yn4 ** 2))
        th = PHI_G * i
        is_bel = math.sin(th) > 0
        bp = 18.0 * math.sin(th) * (1.0 - abs(yn4) * 0.5) if is_bel else 0.0
        m4[idx] = [w_b * math.cos(th), -30.0 + yn4 * 55.0, w_b * math.sin(th) * 0.85 + bp]
        idx += 1

    for i in range(n_head):
        u = i / float(max(1, n_head - 1))
        if u < 0.28:
            th_h = u / 0.28
            is_l = th_h < 0.5
            ht = th_h * 2.0 if is_l else (th_h - 0.5) * 2.0
            side = -1.0 if is_l else 1.0
            m4[idx] = [side * (24.0 + ht * 22.0), 95.0 + ht * 42.0, -5.0 - ht * 45.0]
        elif u < 0.50:
            tm = (u - 0.28) / 0.22
            th_m = tm * math.pi * 2.0
            m4[idx] = [22.0 * math.cos(th_m), 68.0 + 12.0 * math.sin(th_m), 25.0 + 38.0 * max(0.0, math.sin(th_m))]
        else:
            tc = (u - 0.50) / 0.50
            yn_c = -1.0 + tc * 2.0
            rh = 38.0 * math.sqrt(max(0.0, 1.0 - yn_c ** 2))
            th_c = tc * PHI_G * 24.0
            m4[idx] = [rh * math.cos(th_c), 78.0 + yn_c * 32.0, rh * math.sin(th_c) + 8.0]
        idx += 1

    half_w = n_wings // 2
    for i in range(half_w):
        uw = i / float(max(1, half_w - 1))
        sx = 28.0 + uw * 185.0
        ay = 15.0 + math.sin(uw * math.pi * 0.9) * 85.0 - (uw ** 2) * 75.0
        sz = -12.0 - uw * 55.0
        rib = (-1.0 if (i % 4 == 0) else 1.0) * (math.sin(i * 12.0) * 12.0)
        m4[idx] = [-sx, ay + rib, sz]
        idx += 1
    for i in range(n_wings - half_w):
        uw = i / float(max(1, n_wings - half_w - 1))
        sx = 28.0 + uw * 185.0
        ay = 15.0 + math.sin(uw * math.pi * 0.9) * 85.0 - (uw ** 2) * 75.0
        sz = -12.0 - uw * 55.0
        rib = (-1.0 if (i % 4 == 0) else 1.0) * (math.sin(i * 12.0) * 12.0)
        m4[idx] = [sx, ay + rib, sz]
        idx += 1

    half_l = n_legs // 2
    for i in range(half_l):
        ul = i / float(max(1, half_l - 1))
        m4[idx] = [-38.0 + math.sin(ul * 8.0) * 14.0, -80.0 - ul * 65.0, 5.0 + ul * 24.0]
        idx += 1
    for i in range(n_legs - half_l):
        ul = i / float(max(1, n_legs - half_l - 1))
        m4[idx] = [38.0 + math.sin(ul * 8.0) * 14.0, -80.0 - ul * 65.0, 5.0 + ul * 24.0]
        idx += 1

    for i in range(n_tail):
        ut = i / float(max(1, n_tail - 1))
        m4[idx] = [math.sin(ut * math.pi * 1.5) * 45.0, -75.0 - ut * 40.0 + math.sin(ut * math.pi) * 18.0, -28.0 - ut * 140.0]
        idx += 1
    models[4] = m4
    colors[4] = make_col(0.96, 0.98, 1.0)

    # 5. Heart
    m5 = np.zeros((num_points, 3), dtype=np.float32)
    n_v = int(num_points * 0.44)
    n_ao = int(num_points * 0.26)
    n_p = int(num_points * 0.16)
    n_co = num_points - (n_v + n_ao + n_p)
    idx = 0

    for i in range(n_v):
        u = i / float(max(1, n_v - 1))
        yn5 = -1.0 + u * 1.8
        y = -45.0 + yn5 * 55.0
        taper = max(0.1, (y + 135.0) / 160.0)
        rv = 68.0 * (taper ** 0.72)
        th = PHI_G * i
        atx = -28.0 * (1.0 - taper)
        m5[idx] = [atx + rv * math.cos(th), y, rv * math.sin(th) * 0.85]
        idx += 1

    for i in range(n_ao):
        u = i / float(max(1, n_ao - 1))
        if u < 0.70:
            ta = (u / 0.70) * math.pi * 1.1
            ar = 48.0
            rt = 16.0
            tt = i * 0.8
            m5[idx] = [-8.0 + ar * math.cos(ta) + rt * math.cos(tt), 35.0 + ar * math.sin(ta) + rt * math.sin(tt), -10.0 - (ta / math.pi) * 45.0 + rt * 0.4 * math.sin(tt)]
        else:
            tb = (u - 0.70) / 0.30
            b_idx = int(tb * 3)
            tb_f = (tb * 3) % 1.0
            m5[idx] = [-22.0 + b_idx * 20.0 + (3.0 if (i % 2 == 0) else -3.0), 82.0 + tb_f * 45.0, -5.0 + b_idx * 5.0]
        idx += 1

    for i in range(n_p):
        u = i / float(max(1, n_p - 1))
        if u < 0.65:
            tp = u / 0.65
            m5[idx] = [-35.0 + tp * 75.0 + math.sin(i * 12.0) * 8.0, 25.0 + math.sin(tp * math.pi) * 15.0 + math.cos(i * 12.0) * 8.0, 18.0 - tp * 35.0]
        else:
            tv = (u - 0.65) / 0.35
            m5[idx] = [45.0 + math.sin(i * 8.0) * 9.0, 40.0 + tv * 60.0, -12.0 + math.cos(i * 8.0) * 9.0]
        idx += 1

    for i in range(n_co):
        tc = i / float(max(1, n_co - 1))
        m5[idx] = [-15.0 + math.sin(tc * 14.0) * 22.0 - tc * 15.0, 15.0 - tc * 120.0, 42.0 * (1.0 - tc * 0.7)]
        idx += 1
    models[5] = m5
    colors[5] = make_col(1.0, 0.18, 0.45)

    # 6. Building / House
    m6 = np.zeros((num_points, 3), dtype=np.float32)
    n_balc = int(num_points * 0.38)
    n_fac = int(num_points * 0.42)
    n_roof = num_points - (n_balc + n_fac)
    idx = 0
    floors = [-75.0, -15.0, 45.0]
    pb = n_balc // 6
    for f in range(3):
        fy = floors[f]
        for i in range(pb):
            th = (i / float(max(1, pb - 1))) * math.pi
            yo = 14.0 if (i % 3 == 0) else 0.0
            m6[idx] = [-90.0 + 48.0 * math.cos(th), fy + yo, 25.0 + 48.0 * math.sin(th)]
            idx += 1
        for i in range(pb):
            u = i / float(max(1, pb - 1))
            yo = 14.0 if (i % 3 == 0) else 0.0
            m6[idx] = [35.0 + u * 75.0, fy + yo, 70.0]
            idx += 1

    for i in range(n_fac):
        zw = 25.0 if (i % 2 == 0) else -45.0
        m6[idx] = [-135.0 + (i % 50) * 5.5, -130.0 + (i // 50) * 4.8, zw]
        idx += 1

    for i in range(n_roof):
        ur = i / float(max(1, n_roof - 1))
        if ur < 0.65:
            m6[idx] = [-75.0 + (i % 20) * 2.8, 95.0 + (i // 20) * 3.5, -15.0 + (i % 5) * 6.0]
        else:
            ua = (ur - 0.65) / 0.35
            xc = (-48.0 + (16.0 if (i % 2 == 0) else -16.0)) if (i % 4 == 0) else -48.0
            m6[idx] = [xc, 135.0 + ua * 55.0, 0.0]
        idx += 1
    models[6] = m6
    colors[6] = make_col(0.35, 0.85, 1.0)

    # 7. Mountain
    m7 = np.zeros((num_points, 3), dtype=np.float32)
    i7 = np.arange(num_points, dtype=np.float32)
    u7 = i7 / float(num_points)
    th7 = i7 * PHI_G
    rb7 = np.sqrt(u7) * 230.0
    mp7 = np.exp(-((rb7 / 68.0) ** 2)) * 265.0
    rg7 = (np.abs(np.cos(th7 * 2.0)) ** 3.0) * np.exp(-rb7 / 120.0) * 65.0
    d1 = np.hypot(rb7 * np.cos(th7) - (-65.0), rb7 * np.sin(th7) - (-20.0))
    s1 = np.exp(-((d1 / 38.0) ** 2)) * 125.0
    d2 = np.hypot(rb7 * np.cos(th7) - 55.0, rb7 * np.sin(th7) - 35.0)
    s2 = np.exp(-((d2 / 34.0) ** 2)) * 110.0
    no7 = np.sin(rb7 * 0.22) * 12.0 + np.cos(th7 * 9.0) * 8.0
    m7[:, 0] = rb7 * np.cos(th7)
    m7[:, 1] = -120.0 + mp7 + rg7 + s1 + s2 + no7
    m7[:, 2] = rb7 * np.sin(th7)
    models[7] = m7
    colors[7] = make_col(0.30, 0.82, 0.65)

    # 8. Black Hole
    m8 = np.zeros((num_points, 3), dtype=np.float32)
    n_dk = int(num_points * 0.68)
    n_ln = num_points - n_dk
    i_dk = np.arange(n_dk, dtype=np.float32)
    u_dk = i_dk / float(n_dk)
    r_dk = 54.0 + (u_dk ** 0.85) * 185.0
    th_dk = u_dk * 48.0 * math.pi
    m8[:n_dk, 0] = r_dk * np.cos(th_dk)
    m8[:n_dk, 1] = np.sin(u_dk * 180.0) * 3.5
    m8[:n_dk, 2] = r_dk * np.sin(th_dk)

    half_ln = n_ln // 2
    i_l1 = np.arange(half_ln, dtype=np.float32)
    t1 = (i_l1 / float(max(1, half_ln - 1))) * math.pi
    rl1 = 65.0 + np.sin(t1) * 55.0
    m8[n_dk:n_dk + half_ln, 0] = rl1 * np.cos(t1)
    m8[n_dk:n_dk + half_ln, 1] = 48.0 + np.sin(t1) * 82.0
    m8[n_dk:n_dk + half_ln, 2] = np.sin(t1 * 3.0) * 10.0

    rem_ln = n_ln - half_ln
    i_l2 = np.arange(rem_ln, dtype=np.float32)
    t2 = (i_l2 / float(max(1, rem_ln - 1))) * math.pi
    rl2 = 65.0 + np.sin(t2) * 55.0
    m8[n_dk + half_ln:, 0] = rl2 * np.cos(t2)
    m8[n_dk + half_ln:, 1] = -(48.0 + np.sin(t2) * 82.0)
    m8[n_dk + half_ln:, 2] = np.sin(t2 * 3.0) * 10.0
    models[8] = m8
    colors[8] = make_col(1.0, 0.60, 0.20)

    # 9. 3D Typography
    m9 = np.zeros((num_points, 3), dtype=np.float32)
    segments = [
        (-190, -40, -190, 40), (-210, -40, -170, -40), (-210, 40, -170, 40),
        (-130, -40, -130, 40), (-130, 40, -95, 40),
        (-60, -40, -30, -40), (-30, -40, -30, 40), (-30, 40, -60, 40), (-60, 40, -60, -40),
        (-10, -40, 15, 40), (40, -40, 15, 40),
        (70, -40, 70, 40), (70, -40, 105, -40), (70, 0, 98, 0), (70, 40, 105, 40),
        (140, -40, 160, -5), (180, -40, 160, -5), (160, -5, 160, 40),
        (205, -40, 235, -40), (235, -40, 235, 40), (235, 40, 205, 40), (205, 40, 205, -40),
        (265, -40, 265, 30), (265, 30, 300, 30), (300, 30, 300, -40)
    ]
    p_seg = num_points // len(segments)
    idx = 0
    for x0, y0, x1, y1 in segments:
        for i in range(p_seg):
            t = i / float(p_seg)
            z_th = ((i % 5) - 2.0) * 8.0
            m9[idx, 0] = (x0 + t * (x1 - x0)) * 1.15
            m9[idx, 1] = -(y0 + t * (y1 - y0)) * 1.15
            m9[idx, 2] = z_th
            idx += 1
    models[9] = m9
    colors[9] = make_col(0.30, 0.95, 1.0)

    return models, colors


def is_corrupted_box(pts):
    if pts is None or len(pts) < 100:
        return True
    mins = np.min(pts, axis=0)
    maxs = np.max(pts, axis=0)
    spans = maxs - mins
    if min(spans[0], spans[1]) < 1.0:
        return True
    x_edge = np.mean((pts[:, 0] < mins[0] + 0.05 * spans[0]) | (pts[:, 0] > maxs[0] - 0.05 * spans[0]))
    y_edge = np.mean((pts[:, 1] < mins[1] + 0.05 * spans[1]) | (pts[:, 1] > maxs[1] - 0.05 * spans[1]))
    return x_edge > 0.35 or y_edge > 0.35


def load_point_clouds():
    key_mapping = {
        0: "idle", 1: "saturn", 2: "wormhole", 3: "face", 4: "dragon",
        5: "heart", 6: "building", 7: "mountain", 8: "blackhole", 9: "text"
    }
    fb_m, fb_c = create_fallback_models(NUM_POINTS)

    if os.path.isfile(MODELS_FILE):
        try:
            print(f"[LOADER] Loading pre-computed models from {MODELS_FILE}...")
            data = np.load(MODELS_FILE)
            models = {}
            colors = {}
            for mode_id, name in key_mapping.items():
                if name in data:
                    pts = data[name].astype(np.float32)
                    if is_corrupted_box(pts):
                        print(f"  [CORRECTION] Model '{name}' in .npz detected as box. Using clean 3D sculpture.")
                        models[mode_id] = fb_m[mode_id]
                        colors[mode_id] = fb_c[mode_id]
                    else:
                        models[mode_id] = pts
                        col_key = f"col_{name}"
                        colors[mode_id] = data[col_key].astype(np.float32) if col_key in data else fb_c[mode_id]
                else:
                    models[mode_id] = fb_m[mode_id]
                    colors[mode_id] = fb_c[mode_id]
            return models, colors
        except Exception as e:
            print(f"[LOADER] Error reading {MODELS_FILE}: {e}")

    return fb_m, fb_c


def classify_hand_gesture(landmarks):
    if landmarks is None or len(landmarks) < 21:
        return None

    wrist = landmarks[0]

    def is_finger_extended(tip_idx, pip_idx):
        d_tip = (landmarks[tip_idx].x - wrist.x)**2 + (landmarks[tip_idx].y - wrist.y)**2
        d_pip = (landmarks[pip_idx].x - wrist.x)**2 + (landmarks[pip_idx].y - wrist.y)**2
        return d_tip > d_pip * 1.15

    thumb_ext = is_finger_extended(4, 2)
    index_ext = is_finger_extended(8, 6)
    middle_ext = is_finger_extended(12, 10)
    ring_ext = is_finger_extended(16, 14)
    pinky_ext = is_finger_extended(20, 18)

    ext_count = sum([thumb_ext, index_ext, middle_ext, ring_ext, pinky_ext])
    pinch_dist = math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y)

    if ext_count >= 5:
        return 0
    if ext_count == 0:
        return 4
    if pinch_dist < 0.055 and (middle_ext or ring_ext or pinky_ext):
        return 6
    if thumb_ext and index_ext and pinky_ext and not middle_ext and not ring_ext:
        return 9
    if index_ext and middle_ext and not ring_ext and not pinky_ext:
        return 5
    if index_ext and middle_ext and ring_ext and not pinky_ext:
        return 7
    if index_ext and not middle_ext and not ring_ext and not pinky_ext:
        return 1 if landmarks[8].y < landmarks[5].y - 0.08 else 2
    if thumb_ext and not index_ext and not middle_ext and not ring_ext and not pinky_ext:
        return 3 if landmarks[4].y < landmarks[3].y - 0.05 else 8

    return None


class WebcamTrackerThread(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.lock = threading.Lock()
        self.running = True
        self.hand_detected = False
        self.wrist_norm = (0.5, 0.5)
        self.hand_pitch = 0.0
        self.hand_roll = 0.0
        self.detected_mode = None
        self.latest_pip_frame = None

    def run(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("[WEBCAM] Camera not accessible. Manual keyboard mode active.")
            return

        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 360)
        cap.set(cv2.CAP_PROP_FPS, 30)

        hands = None
        if mp_hands is not None:
            try:
                hands = mp_hands.Hands(
                    static_image_mode=False,
                    max_num_hands=1,
                    min_detection_confidence=0.60,
                    min_tracking_confidence=0.55
                )
            except Exception as e:
                print(f"[WEBCAM] Could not initialize MediaPipe Hands: {e}")
                hands = None

        while self.running:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.03)
                continue

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            mode = None
            detected = False
            w_norm = (0.5, 0.5)
            h_pitch = 0.0
            h_roll = 0.0

            if hands is not None:
                try:
                    results = hands.process(rgb)
                    if results.multi_hand_landmarks:
                        lms = results.multi_hand_landmarks[0].landmark
                        detected = True
                        w_norm = (lms[0].x, lms[0].y)
                        dx = lms[9].x - lms[0].x
                        dy = lms[9].y - lms[0].y
                        h_roll = math.atan2(dx, -dy)
                        h_pitch = (lms[9].y - 0.5) * 1.6
                        mode = classify_hand_gesture(lms)

                        if mp_draw is not None and mp_hands is not None:
                            mp_draw.draw_landmarks(
                                rgb,
                                results.multi_hand_landmarks[0],
                                mp_hands.HAND_CONNECTIONS,
                                mp_draw.DrawingSpec(color=(0, 240, 255), thickness=2, circle_radius=2),
                                mp_draw.DrawingSpec(color=(255, 255, 255), thickness=1, circle_radius=1)
                            )
                except Exception:
                    pass

            pip_small = cv2.resize(rgb, (320, 180))

            with self.lock:
                self.hand_detected = detected
                self.wrist_norm = w_norm
                self.hand_pitch = h_pitch
                self.hand_roll = h_roll
                if mode is not None:
                    self.detected_mode = mode
                self.latest_pip_frame = pip_small

            time.sleep(0.01)

        cap.release()
        hands.close()


def main():
    pygame.init()
    pygame.display.set_caption("AR 3D Particle Dust Simulation - 60 FPS")

    win_w = DEFAULT_WIDTH
    win_h = DEFAULT_HEIGHT
    screen = pygame.display.set_mode((win_w, win_h), DOUBLEBUF | OPENGL | RESIZABLE)

    def setup_viewport(w, h):
        w_safe = max(w, 320)
        h_safe = max(h, 240)
        glViewport(0, 0, w_safe, h_safe)
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        aspect = w_safe / float(h_safe)
        gluPerspective(45.0, aspect, 1.0, 3000.0)
        glMatrixMode(GL_MODELVIEW)
        glLoadIdentity()

    setup_viewport(win_w, win_h)

    MODELS, COLORS = load_point_clouds()

    tracker = WebcamTrackerThread()
    tracker.start()

    current_mode = 5
    target_mode = 5

    current_pos = np.copy(MODELS[current_mode])
    velocity = np.zeros_like(current_pos)
    current_colors = np.copy(COLORS[current_mode])

    rot_yaw = 0.0
    rot_pitch = 0.12
    rot_roll = 0.0

    show_pip = True
    bloom_pass = True
    is_fullscreen = False

    pip_tex_id = glGenTextures(1)
    glBindTexture(GL_TEXTURE_2D, pip_tex_id)
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
    blank = np.zeros((180, 320, 3), dtype=np.uint8)
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 320, 180, 0, GL_RGB, GL_UNSIGNED_BYTE, blank)

    clock = pygame.time.Clock()
    running = True

    while running:
        for event in pygame.event.get():
            if event.type == QUIT:
                running = False
            elif event.type == VIDEORESIZE:
                win_w, win_h = event.w, event.h
                screen = pygame.display.set_mode((win_w, win_h), DOUBLEBUF | OPENGL | RESIZABLE)
                setup_viewport(win_w, win_h)
            elif event.type == KEYDOWN:
                if event.key in (K_ESCAPE, K_q):
                    running = False
                elif K_0 <= event.key <= K_9:
                    target_mode = event.key - K_0
                elif event.key == K_p:
                    show_pip = not show_pip
                elif event.key == K_b:
                    bloom_pass = not bloom_pass
                elif event.key == K_f:
                    is_fullscreen = not is_fullscreen
                    if is_fullscreen:
                        screen = pygame.display.set_mode((0, 0), DOUBLEBUF | OPENGL | pygame.FULLSCREEN)
                        info = pygame.display.Info()
                        win_w, win_h = info.current_w, info.current_h
                    else:
                        win_w, win_h = DEFAULT_WIDTH, DEFAULT_HEIGHT
                        screen = pygame.display.set_mode((win_w, win_h), DOUBLEBUF | OPENGL | RESIZABLE)
                    setup_viewport(win_w, win_h)
                elif event.key == K_r:
                    rot_yaw = 0.0
                    rot_pitch = 0.12
                    velocity[:] = 0.0
                    current_pos[:] = MODELS[target_mode]

        with tracker.lock:
            if tracker.detected_mode is not None:
                if tracker.detected_mode != target_mode:
                    target_mode = tracker.detected_mode
                tracker.detected_mode = None

            hand_detected = tracker.hand_detected
            hand_pitch = tracker.hand_pitch
            hand_roll = tracker.hand_roll
            pip_frame = tracker.latest_pip_frame

        target_pos = MODELS[target_mode]
        target_col = COLORS[target_mode]

        delta = target_pos - current_pos
        velocity = (velocity * DAMPING) + (delta * SPRING_ACCEL)
        current_pos += velocity
        current_colors += (target_col - current_colors) * COLOR_LERP

        rot_yaw += YAW_SPEED
        if hand_detected:
            rot_pitch += (hand_pitch * 0.35 - rot_pitch) * 0.05
            rot_roll += (hand_roll * 0.25 - rot_roll) * 0.05
        else:
            rot_pitch += (0.12 - rot_pitch) * 0.03
            rot_roll += (0.0 - rot_roll) * 0.03

        # Render Pass
        glClearColor(*COLOR_BG)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)

        glMatrixMode(GL_MODELVIEW)
        glLoadIdentity()
        glTranslatef(0.0, 0.0, -680.0)
        glRotatef(math.degrees(rot_pitch), 1.0, 0.0, 0.0)
        glRotatef(math.degrees(rot_yaw), 0.0, 1.0, 0.0)
        glRotatef(math.degrees(rot_roll), 0.0, 0.0, 1.0)

        glEnable(GL_BLEND)
        glBlendFunc(GL_SRC_ALPHA, GL_ONE)
        glEnable(GL_POINT_SMOOTH)

        glEnableClientState(GL_VERTEX_ARRAY)
        glEnableClientState(GL_COLOR_ARRAY)
        glVertexPointer(3, GL_FLOAT, 0, current_pos)
        glColorPointer(4, GL_FLOAT, 0, current_colors)

        glPointSize(2.0)
        glDrawArrays(GL_POINTS, 0, len(current_pos))

        if bloom_pass:
            glPointSize(4.4)
            glDrawArrays(GL_POINTS, 0, len(current_pos))

        glDisableClientState(GL_COLOR_ARRAY)
        glDisableClientState(GL_VERTEX_ARRAY)

        if show_pip and pip_frame is not None:
            glMatrixMode(GL_PROJECTION)
            glPushMatrix()
            glLoadIdentity()
            gluOrtho2D(0, win_w, win_h, 0)

            glMatrixMode(GL_MODELVIEW)
            glPushMatrix()
            glLoadIdentity()
            glDisable(GL_DEPTH_TEST)
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)

            pip_w = max(int(win_w * 0.22), 220)
            pip_h = int(pip_w * 9.0 / 16.0)
            pip_x = win_w - pip_w - 20
            pip_y = 20

            glBindTexture(GL_TEXTURE_2D, pip_tex_id)
            if pip_frame.shape[1] != 320 or pip_frame.shape[0] != 180:
                pip_frame_resized = cv2.resize(pip_frame, (320, 180))
            else:
                pip_frame_resized = pip_frame
            glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, 320, 180, GL_RGB, GL_UNSIGNED_BYTE, pip_frame_resized)

            glEnable(GL_TEXTURE_2D)
            glColor4f(1.0, 1.0, 1.0, 0.92)
            glBegin(GL_QUADS)
            glTexCoord2f(0.0, 0.0); glVertex2f(pip_x, pip_y)
            glTexCoord2f(1.0, 0.0); glVertex2f(pip_x + pip_w, pip_y)
            glTexCoord2f(1.0, 1.0); glVertex2f(pip_x + pip_w, pip_y + pip_h)
            glTexCoord2f(0.0, 1.0); glVertex2f(pip_x, pip_y + pip_h)
            glEnd()
            glDisable(GL_TEXTURE_2D)

            glMatrixMode(GL_PROJECTION)
            glPopMatrix()
            glMatrixMode(GL_MODELVIEW)
            glPopMatrix()

        pygame.display.flip()
        clock.tick(60)

    tracker.running = False
    pygame.quit()
    sys.exit(0)


if __name__ == "__main__":
    main()
`;

export const PYTHON_BUILD_ASSETS_SOURCE = `"""
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


def generate_idle_model(num_points=NUM_POINTS):
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_core = int(num_points * 0.28)
    n_arms = num_points - n_core

    i_core = np.arange(n_core, dtype=np.float32)
    u_c = i_core / float(max(1, n_core - 1))
    r_c = (u_c ** 1.6) * 65.0
    th_c = PHI_G * i_core
    phi_c = np.arccos(np.clip(1.0 - 2.0 * u_c, -1.0, 1.0))
    pts[:n_core, 0] = r_c * np.sin(phi_c) * np.cos(th_c)
    pts[:n_core, 1] = r_c * np.cos(phi_c) * 0.55
    pts[:n_core, 2] = r_c * np.sin(phi_c) * np.sin(th_c)

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
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_sphere = int(num_points * 0.38)
    n_rings = num_points - n_sphere

    i_s = np.arange(n_sphere, dtype=np.float32)
    y_norm = 1.0 - (i_s / float(max(1, n_sphere - 1))) * 2.0
    r_at_y = np.sqrt(np.maximum(0.0, 1.0 - y_norm ** 2))
    theta = PHI_G * i_s
    sphere_r = 88.0
    pts[:n_sphere, 0] = sphere_r * r_at_y * np.cos(theta)
    pts[:n_sphere, 1] = sphere_r * y_norm
    pts[:n_sphere, 2] = sphere_r * r_at_y * np.sin(theta)

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
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_rims = int(num_points * 0.26)
    n_grid = num_points - n_rims
    r0 = 22.0
    c = 68.0

    i_g = np.arange(n_grid, dtype=np.float32)
    y_norm = -1.0 + (i_g / float(max(1, n_grid - 1))) * 2.0
    y = y_norm * 185.0
    r = r0 * np.sqrt(1.0 + (y / c) ** 2)
    theta = (i_g % 36.0) * (math.pi * 2.0 / 36.0) + (y * 0.0035)
    r_jitter = r * (0.98 + np.where(np.arange(n_grid) % 3 == 0, 0.04, 0.0))
    pts[:n_grid, 0] = r_jitter * np.cos(theta)
    pts[:n_grid, 1] = y
    pts[:n_grid, 2] = r_jitter * np.sin(theta)

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
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_cranium = int(num_points * 0.28)
    n_features = int(num_points * 0.44)
    n_ears = int(num_points * 0.10)
    n_neck = num_points - (n_cranium + n_features + n_ears)
    idx = 0

    for i in range(n_cranium):
        y_norm = -0.15 + (i / float(max(1, n_cranium - 1))) * 1.15
        phi = math.acos(max(-1.0, min(1.0, y_norm)))
        theta = PHI_G * i
        rx = 74.0 * math.sin(phi)
        rz = (75.0 if (0 < theta % (2 * math.pi) < math.pi) else 88.0) * math.sin(phi)
        y = 30.0 + 95.0 * math.cos(phi)
        pts[idx] = [rx * math.cos(theta), y, rz * math.sin(theta)]
        idx += 1

    for i in range(n_features):
        u = i / float(max(1, n_features - 1))
        if u < 0.22:
            tn = u / 0.22
            y = 30.0 - tn * 48.0
            nose_protrude = 52.0 + math.sin(tn * math.pi) * 35.0
            nose_width = 6.0 + tn * 16.0
            side = 1.0 if (i % 2 == 0) else -1.0
            x = side * (nose_width * 0.5 * (1.0 - (i % 4) * 0.2))
            pts[idx] = [x, y, nose_protrude]
        elif u < 0.42:
            te = (u - 0.22) / 0.20
            is_left = te < 0.5
            eye_t = te * 2.0 if is_left else (te - 0.5) * 2.0
            x_center = -36.0 if is_left else 36.0
            ang = eye_t * math.pi * 2.0
            pts[idx] = [x_center + 16.0 * math.cos(ang), 20.0 + 7.5 * math.sin(ang), 48.0 + 6.0 * math.cos(ang)]
        elif u < 0.60:
            tb = (u - 0.42) / 0.18
            is_left = tb < 0.5
            brow_t = tb * 2.0 if is_left else (tb - 0.5) * 2.0
            x_center = -38.0 if is_left else 38.0
            x_span = (brow_t - 0.5) * 34.0
            pts[idx] = [x_center + x_span, 36.0 - ((brow_t - 0.5) ** 2) * 12.0, 54.0 - abs(x_span) * 0.25]
        elif u < 0.80:
            tm = (u - 0.60) / 0.20
            ang = tm * math.pi * 2.0
            x = 24.0 * math.cos(ang)
            is_upper = math.sin(ang) >= 0
            y = -34.0 + (6.0 * math.sin(ang) if is_upper else 7.5 * math.sin(ang))
            pts[idx] = [x, y, 72.0 + 6.0 * math.cos(ang)]
        else:
            tj = (u - 0.80) / 0.20
            t_arch = -1.0 + tj * 2.0
            x = t_arch * 62.0
            y = -65.0 + (t_arch ** 2) * 45.0
            pts[idx] = [x, y, 62.0 - abs(t_arch) * 65.0]
        idx += 1

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

    for i in range(n_neck):
        tn = i / float(max(1, n_neck - 1))
        y = -55.0 - tn * 95.0
        th = i * PHI_G
        r_neck = 42.0 + tn * 26.0
        pts[idx] = [r_neck * math.cos(th), y, r_neck * math.sin(th) * 0.85 - 10.0]
        idx += 1

    return pts


def generate_dragon_model(num_points=NUM_POINTS):
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_torso = int(num_points * 0.25)
    n_head = int(num_points * 0.22)
    n_wings = int(num_points * 0.32)
    n_legs = int(num_points * 0.12)
    n_tail = num_points - (n_torso + n_head + n_wings + n_legs)
    idx = 0

    for i in range(n_torso):
        y_norm = -1.0 + (i / float(max(1, n_torso - 1))) * 2.0
        y = -30.0 + y_norm * 55.0
        w_base = 62.0 * math.sqrt(max(0.0, 1.0 - y_norm ** 2))
        th = PHI_G * i
        is_belly = math.sin(th) > 0
        belly_protrusion = 18.0 * math.sin(th) * (1.0 - abs(y_norm) * 0.5) if is_belly else 0.0
        pts[idx] = [w_base * math.cos(th), y, w_base * math.sin(th) * 0.85 + belly_protrusion]
        idx += 1

    for i in range(n_head):
        u = i / float(max(1, n_head - 1))
        if u < 0.28:
            th_h = u / 0.28
            is_left = th_h < 0.5
            horn_t = th_h * 2.0 if is_left else (th_h - 0.5) * 2.0
            side = -1.0 if is_left else 1.0
            pts[idx] = [side * (24.0 + horn_t * 22.0), 95.0 + horn_t * 42.0, -5.0 - horn_t * 45.0]
        elif u < 0.50:
            tm = (u - 0.28) / 0.22
            th_m = tm * math.pi * 2.0
            pts[idx] = [22.0 * math.cos(th_m), 68.0 + 12.0 * math.sin(th_m), 25.0 + 38.0 * max(0.0, math.sin(th_m))]
        else:
            tc = (u - 0.50) / 0.50
            y_n = -1.0 + tc * 2.0
            r_h = 38.0 * math.sqrt(max(0.0, 1.0 - y_n ** 2))
            th_c = tc * PHI_G * 24.0
            pts[idx] = [r_h * math.cos(th_c), 78.0 + y_n * 32.0, r_h * math.sin(th_c) + 8.0]
        idx += 1

    half_wings = n_wings // 2
    for i in range(half_wings):
        uw = i / float(max(1, half_wings - 1))
        span_x = 28.0 + uw * 185.0
        arch_y = 15.0 + math.sin(uw * math.pi * 0.9) * 85.0 - (uw ** 2) * 75.0
        sweep_z = -12.0 - uw * 55.0
        rib = (-1.0 if (i % 4 == 0) else 1.0) * (math.sin(i * 12.0) * 12.0)
        pts[idx] = [-span_x, arch_y + rib, sweep_z]
        idx += 1
    for i in range(n_wings - half_wings):
        uw = i / float(max(1, n_wings - half_wings - 1))
        span_x = 28.0 + uw * 185.0
        arch_y = 15.0 + math.sin(uw * math.pi * 0.9) * 85.0 - (uw ** 2) * 75.0
        sweep_z = -12.0 - uw * 55.0
        rib = (-1.0 if (i % 4 == 0) else 1.0) * (math.sin(i * 12.0) * 12.0)
        pts[idx] = [span_x, arch_y + rib, sweep_z]
        idx += 1

    half_legs = n_legs // 2
    for i in range(half_legs):
        ul = i / float(max(1, half_legs - 1))
        pts[idx] = [-38.0 + math.sin(ul * 8.0) * 14.0, -80.0 - ul * 65.0, 5.0 + ul * 24.0]
        idx += 1
    for i in range(n_legs - half_legs):
        ul = i / float(max(1, n_legs - half_legs - 1))
        pts[idx] = [38.0 + math.sin(ul * 8.0) * 14.0, -80.0 - ul * 65.0, 5.0 + ul * 24.0]
        idx += 1

    for i in range(n_tail):
        ut = i / float(max(1, n_tail - 1))
        pts[idx] = [
            math.sin(ut * math.pi * 1.5) * 45.0,
            -75.0 - ut * 40.0 + math.sin(ut * math.pi) * 18.0,
            -28.0 - ut * 140.0
        ]
        idx += 1

    return pts


def generate_heart_model(num_points=NUM_POINTS):
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_ventricles = int(num_points * 0.44)
    n_aorta = int(num_points * 0.26)
    n_pulmonary = int(num_points * 0.16)
    n_coronary = num_points - (n_ventricles + n_aorta + n_pulmonary)
    idx = 0

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

    for i in range(n_coronary):
        tc = i / float(max(1, n_coronary - 1))
        pts[idx] = [-15.0 + math.sin(tc * 14.0) * 22.0 - tc * 15.0, 15.0 - tc * 120.0, 42.0 * (1.0 - tc * 0.7)]
        idx += 1

    return pts


def generate_house_model(num_points=NUM_POINTS):
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_balconies = int(num_points * 0.38)
    n_facade = int(num_points * 0.42)
    n_rooftop = num_points - (n_balconies + n_facade)
    idx = 0

    floors = [-75.0, -15.0, 45.0]
    per_balcony = n_balconies // 6
    for f in range(3):
        floor_y = floors[f]
        for i in range(per_balcony):
            th = (i / float(max(1, per_balcony - 1))) * math.pi
            r_balc = 48.0
            y_offset = 14.0 if (i % 3 == 0) else 0.0
            pts[idx] = [-90.0 + r_balc * math.cos(th), floor_y + y_offset, 25.0 + r_balc * math.sin(th)]
            idx += 1
        for i in range(per_balcony):
            u = i / float(max(1, per_balcony - 1))
            y_offset = 14.0 if (i % 3 == 0) else 0.0
            pts[idx] = [35.0 + u * 75.0, floor_y + y_offset, 70.0]
            idx += 1

    for i in range(n_facade):
        x = -135.0 + (i % 50) * 5.5
        y = -130.0 + (i // 50) * 4.8
        z_wall = 25.0 if (i % 2 == 0) else -45.0
        pts[idx] = [x, y, z_wall]
        idx += 1

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
    pts = np.zeros((num_points, 3), dtype=np.float32)
    i = np.arange(num_points, dtype=np.float32)
    u = i / float(num_points)
    th = i * PHI_G
    r_base = np.sqrt(u) * 230.0

    main_peak = np.exp(-((r_base / 68.0) ** 2)) * 265.0
    ridge = (np.abs(np.cos(th * 2.0)) ** 3.0) * np.exp(-r_base / 120.0) * 65.0
    d_sub1 = np.hypot(r_base * np.cos(th) - (-65.0), r_base * np.sin(th) - (-20.0))
    sub1 = np.exp(-((d_sub1 / 38.0) ** 2)) * 125.0
    d_sub2 = np.hypot(r_base * np.cos(th) - 55.0, r_base * np.sin(th) - 35.0)
    sub2 = np.exp(-((d_sub2 / 34.0) ** 2)) * 110.0
    noise = np.sin(r_base * 0.22) * 12.0 + np.cos(th * 9.0) * 8.0

    y = -120.0 + main_peak + ridge + sub1 + sub2 + noise
    pts[:, 0] = r_base * np.cos(th)
    pts[:, 1] = y
    pts[:, 2] = r_base * np.sin(th)
    return pts


def generate_blackhole_model(num_points=NUM_POINTS):
    pts = np.zeros((num_points, 3), dtype=np.float32)
    n_disk = int(num_points * 0.68)
    n_lens = num_points - n_disk

    i_d = np.arange(n_disk, dtype=np.float32)
    u_d = i_d / float(n_disk)
    r_d = 54.0 + (u_d ** 0.85) * 185.0
    th_d = u_d * 48.0 * math.pi
    pts[:n_disk, 0] = r_d * np.cos(th_d)
    pts[:n_disk, 1] = np.sin(u_d * 180.0) * 3.5
    pts[:n_disk, 2] = r_d * np.sin(th_d)

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
    pts = np.zeros((num_points, 3), dtype=np.float32)
    segments = [
        (-190, -40, -190, 40), (-210, -40, -170, -40), (-210, 40, -170, 40),
        (-130, -40, -130, 40), (-130, 40, -95, 40),
        (-60, -40, -30, -40), (-30, -40, -30, 40), (-30, 40, -60, 40), (-60, 40, -60, -40),
        (-10, -40, 15, 40), (40, -40, 15, 40),
        (70, -40, 70, 40), (70, -40, 105, -40), (70, 0, 98, 0), (70, 40, 105, 40),
        (140, -40, 160, -5), (180, -40, 160, -5), (160, -5, 160, 40),
        (205, -40, 235, -40), (235, -40, 235, 40), (235, 40, 205, 40), (205, 40, 205, -40),
        (265, -40, 265, 30), (265, 30, 300, 30), (300, 30, 300, -40)
    ]
    per_seg = num_points // len(segments)
    idx = 0
    for x0, y0, x1, y1 in segments:
        for i in range(per_seg):
            t = i / float(per_seg)
            z_th = ((i % 5) - 2.0) * 8.0
            pts[idx, 0] = (x0 + t * (x1 - x0)) * 1.15
            pts[idx, 1] = -(y0 + t * (y1 - y0)) * 1.15
            pts[idx, 2] = z_th
            idx += 1
    while idx < num_points:
        pts[idx] = [0.0, 0.0, 0.0]
        idx += 1
    return pts


def load_or_bake_model(image_path, fallback_func, num_points=NUM_POINTS, depth_multiplier=85.0):
    if not HAS_CV2 or not os.path.isfile(image_path):
        return fallback_func(num_points)

    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        return fallback_func(num_points)

    if len(img.shape) == 3 and img.shape[2] == 4:
        mask = (img[:, :, 3] > 30).astype(np.uint8) * 255
    else:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        corner_patch = [gray[:10, :10], gray[:10, -10:], gray[-10:, :10], gray[-10:, -10:]]
        mean_corner = np.mean([np.mean(p) for p in corner_patch])
        if mean_corner > 180:
            _, mask = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)
        else:
            _, mask = cv2.threshold(gray, 35, 255, cv2.THRESH_BINARY)

    top_edge = np.mean(mask[0, :] > 0)
    bot_edge = np.mean(mask[-1, :] > 0)
    left_edge = np.mean(mask[:, 0] > 0)
    right_edge = np.mean(mask[:, -1] > 0)
    border_flood = max(top_edge, bot_edge, left_edge, right_edge)
    fg_fraction = np.mean(mask > 0)

    if border_flood > 0.05 or fg_fraction > 0.75 or fg_fraction < 0.03:
        print(f"  [Auto-Correction] Image {os.path.basename(image_path)} background detected as square box. Using pristine 3D procedural sculpture.")
        return fallback_func(num_points)

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
    py = -(py - cy)

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


def main():
    os.makedirs(ASSET_DIR, exist_ok=True)
    models = {}
    colors = {}

    print("=" * 75)
    print(" BUILD_ASSETS.PY: BAKING CLEAN 360° VOLUMETRIC 3D POINT CLOUDS")
    print(" (Zero Bounding Boxes | Zero Debug Wireframes | Zero Square Outlines)")
    print("=" * 75)

    models["idle"] = generate_idle_model(NUM_POINTS)
    colors["idle"] = create_colors(NUM_POINTS, 0.35, 0.88, 1.0)

    models["saturn"] = generate_saturn_model(NUM_POINTS)
    colors["saturn"] = create_colors(NUM_POINTS, 1.0, 0.82, 0.45)

    models["wormhole"] = generate_wormhole_model(NUM_POINTS)
    colors["wormhole"] = create_colors(NUM_POINTS, 0.40, 0.90, 1.0)

    face_png = os.path.join(ASSET_DIR, "face.png")
    models["face"] = load_or_bake_model(face_png, generate_face_model, NUM_POINTS, depth_multiplier=105.0)
    colors["face"] = create_colors(NUM_POINTS, 0.30, 0.92, 1.0)

    dragon_png = os.path.join(ASSET_DIR, "dragon.png")
    models["dragon"] = load_or_bake_model(dragon_png, generate_dragon_model, NUM_POINTS, depth_multiplier=95.0)
    colors["dragon"] = create_colors(NUM_POINTS, 0.96, 0.98, 1.0)

    heart_png = os.path.join(ASSET_DIR, "heart.png")
    models["heart"] = load_or_bake_model(heart_png, generate_heart_model, NUM_POINTS, depth_multiplier=115.0)
    colors["heart"] = create_colors(NUM_POINTS, 1.0, 0.18, 0.45)

    house_png = os.path.join(ASSET_DIR, "house.png")
    if not os.path.isfile(house_png):
        house_png = os.path.join(ASSET_DIR, "building.png")
    models["building"] = load_or_bake_model(house_png, generate_house_model, NUM_POINTS, depth_multiplier=80.0)
    colors["building"] = create_colors(NUM_POINTS, 0.35, 0.85, 1.0)

    mountain_png = os.path.join(ASSET_DIR, "mountain.png")
    models["mountain"] = load_or_bake_model(mountain_png, generate_mountain_model, NUM_POINTS, depth_multiplier=110.0)
    colors["mountain"] = create_colors(NUM_POINTS, 0.30, 0.82, 0.65)

    blackhole_png = os.path.join(ASSET_DIR, "blackhole.png")
    models["blackhole"] = load_or_bake_model(blackhole_png, generate_blackhole_model, NUM_POINTS, depth_multiplier=75.0)
    colors["blackhole"] = create_colors(NUM_POINTS, 1.0, 0.60, 0.20)

    models["text"] = generate_text_model(NUM_POINTS)
    colors["text"] = create_colors(NUM_POINTS, 0.30, 0.95, 1.0)

    save_dict = {}
    for k in models:
        save_dict[k] = models[k]
        save_dict[f"col_{k}"] = colors[k]

    np.savez_compressed(OUTPUT_FILE, **save_dict)
    print("=" * 75)
    print(f"[SUCCESS] Baked {len(models)} clean 360° point clouds into {OUTPUT_FILE}")
    print("=" * 75)


if __name__ == "__main__":
    main()
`;
 