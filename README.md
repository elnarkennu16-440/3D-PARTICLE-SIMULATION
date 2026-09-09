# AR 3D Particle Dust Simulation (Python Engine)

An interactive, real-time gesture-controlled 3D particle physics simulation powered by OpenCV, MediaPipe Hands, Pygame, and OpenGL. Thousands of glowing stardust particles morph smoothly between 11 volumetric 3D sculptures based on hand gestures detected from your webcam.

## ✨ Core Features

- **Gesture-Controlled 3D Morphing**: Control 11 volumetric 3D particle shapes using only your webcam and hand gestures.
- **Pure Particle Physics**: Real-time spring physics, velocity damping, turbulent drift, and 3D depth sorting with zero bounding boxes or debug wireframes.
- **6-DOF Hand Interaction**: Real-time hand translation, pitch, roll, and distance rotate and influence the 3D particle field.
- **Zero-Latency Inset PIP**: Clean webcam feed in the top-right corner with hand skeleton tracking overlaid inside the PIP and an active gesture recognition HUD banner.
- **Pre-Baked 3D Assets**: `build_assets.py` prepares Euclidean 3D point clouds and saves to `assets/models_3d.npz` with automatic fallback to embedded mathematical sculptures.

---

## 🖐️ Hand Gestures Guide

| Gesture | Target 3D Model | Description |
| :--- | :--- | :--- |
| 🖐️ **Open Palm** | Cosmic Spiral Galaxy | All 5 fingers extended outward |
| ☝️ **Pointing Up** | Saturn with Planetary Rings | Index finger pointing up |
| 👇 **Pointing Down** | Gravitational Wormhole | Index finger pointing down |
| 👍 **Thumbs Up** | Sculpted Face Bust | Thumb up with fingers curled |
| ✊ **Closed Fist** | Horned Dragon Head Bust | All 4 fingers and thumb curled tight |
| ✌️ **Peace Sign (V)** | Pulsing Anatomical Heart | Index & Middle fingers extended |
| 👌 **OK Sign** | Art-Deco Skyscraper | Index and Thumb pinched together |
| 🖖 **Three Fingers** | Alpine Mountain Massif | Index, Middle, and Ring fingers up |
| 👎 **Thumbs Down** | Gargantua Black Hole | Thumb down with fingers curled |
| 🤘 **Rock / Love Sign** | 3D Text ("KENNU") | Index & Pinky extended (Rock-on / ILY) |
| 🐍 **4 Fingers Raised** | King Cobra Snake | 4 fingers up with thumb folded across palm |

---

## 🚀 Quick Start (Python)

### 1. Set Up Environment
```bash
# Clone the repository
git clone https://github.com/elnarkennu16-440/3D-PARTICLE-SIMULATION.git
cd 3D-PARTICLE-SIMULATION

# Create & activate a Python virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux / macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```
*(Or install directly: `pip install pygame PyOpenGL PyOpenGL_accelerate opencv-python mediapipe numpy`)*

### 3. Run the Simulation
```bash
python main.py
```

### 4. (Optional) Bake 3D Assets
To re-generate or bake new 3D models into `assets/models_3d.npz`:
```bash
python build_assets.py
```

---

## ⌨️ Controls & Shortcuts

| Key | Action |
| :--- | :--- |
| `0` - `9` | Manually select morph shape |
| `C` or `S` | Morph to King Cobra Snake |
| `P` | Toggle Picture-in-Picture webcam feed |
| `B` | Toggle bloom lighting effect |
| `Q` or `ESC` | Quit simulation |

---

## 📁 Project Structure

```text
├── main.py              # Main real-time Pygame + OpenGL + MediaPipe simulation
├── build_assets.py      # Asset generator and 3D point cloud baker
├── requirements.txt     # Python package requirements
├── assets/              # Stored 3D models (.npz) and textures
└── README.md            # Documentation and gesture reference
```

## 🛠️ Tech Stack

- **Python 3.9 - 3.11**
- **MediaPipe Hands** (Real-time 21-landmark hand gesture recognition)
- **OpenCV** (Webcam capture and frame preprocessing)
- **Pygame & PyOpenGL** (60 FPS particle rendering and window management)
- **NumPy** (Vectorized spring physics, 3D rotations, and vertex transforms)

