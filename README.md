# AR 3D Particle Dust Simulation

An interactive, real-time gesture-controlled 3D particle physics simulation powered by MediaPipe hand tracking. Particles morph smoothly between 11 intricate 3D models and sculptures based on your hand signs.

![Python & Web AR Simulation](public/banner.png)

## ✨ Features

- **Gesture-Controlled Morphing**: Control 11 volumetric 3D particle shapes using only your webcam and hand gestures.
- **Physics Engine**: Smooth spring physics, velocity damping, turbulent drift, and 3D depth sorting.
- **6-DOF Hand Interaction**: Real-time hand translation, pitch, roll, and distance rotate and influence the 3D particle field.
- **Dual Architecture**:
  - **Desktop Engine**: High-performance Python with OpenCV, Pygame, and NumPy.
  - **Web Engine**: React + TypeScript + HTML5 Canvas & WebGL with in-browser MediaPipe.

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

## 🚀 Getting Started

### Option 1: Run the Desktop Python Engine

1. **Activate your Python environment** (or create one):
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   ```

2. **Install dependencies**:
   ```bash
   pip install opencv-python mediapipe pygame numpy
   ```

3. **Run the simulation**:
   ```bash
   python main.py
   ```
   *Keyboard shortcuts in Python app*:
   - `0` - `9`: Manual shape selection
   - `C` or `S`: Cobra Snake
   - `P`: Toggle Picture-in-Picture webcam
   - `B`: Toggle bloom lighting
   - `Q`: Quit

---

### Option 2: Run the Web Application

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start the local dev server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser and allow camera access.

---

## 🛠️ Tech Stack

- **Python Desktop**: Python 3.10+, Pygame, OpenCV, MediaPipe, NumPy
- **Web App**: TypeScript, React 18, Vite, Tailwind CSS, MediaPipe Hands, Lucide Icons
