/**
 * 3D AR Particle Dust Simulation Engine
 * Critically Damped Spring Physics & Crisp Pinpoint 1-2px Projection
 */
import { ShapeMode, SimulationConfig } from '../types';
import { generateShapePoints, GESTURE_CATALOG } from '../math/shapes3d';
import { soundFx } from '../audio/soundEffects';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  tx: number;
  ty: number;
  tz: number;
  r: number;
  g: number;
  b: number;
  tr: number;
  tg: number;
  tb: number;
}

export class ParticleEngine {
  public particles: Particle[] = [];
  public currentMode: ShapeMode = 'HEART';
  public rotYaw: number = 0;
  public rotPitch: number = 0.15;

  public anchorX: number = 640;
  public anchorY: number = 360;
  public smoothAnchorX: number = 640;
  public smoothAnchorY: number = 360;
  public handPitch: number = 0;
  public handRoll: number = 0;
  public handVx: number = 0;
  public handVy: number = 0;
  public isHandLocked: boolean = false;

  public config: SimulationConfig = {
    particleCount: 6000,
    fov: 620,
    springK: 0.15,
    damping: 0.78,
    noiseStrength: 0.0,
    rotationSpeed: 0.015,
    bloomEnabled: true,
    arOverlay: false,
    soundEnabled: true,
    showLandmarks: true,
  };

  private width: number = 1280;
  private height: number = 720;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.anchorX = width / 2;
    this.anchorY = height / 2;
    this.smoothAnchorX = width / 2;
    this.smoothAnchorY = height / 2;
    this.initParticles();
  }

  public resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.anchorX = w / 2;
    this.anchorY = h / 2;
  }

  private parseHexColor(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  public initParticles() {
    const count = this.config.particleCount;
    this.particles = new Array(count);
    const targetCoords = generateShapePoints(this.currentMode, count);
    const catalogItem = GESTURE_CATALOG.find((c) => c.id === this.currentMode) || GESTURE_CATALOG[5];
    const colA = this.parseHexColor(catalogItem.colors[0]);
    const colB = this.parseHexColor(catalogItem.colors[1]);
    const colC = this.parseHexColor(catalogItem.colors[2]);

    for (let i = 0; i < count; i++) {
      const tx = targetCoords[i * 3 + 0];
      const ty = targetCoords[i * 3 + 1];
      const tz = targetCoords[i * 3 + 2];

      const rRatio = (i % 3) / 2.0;
      let r = colA[0], g = colA[1], b = colA[2];
      if (rRatio > 0.6) {
        r = colC[0]; g = colC[1]; b = colC[2];
      } else if (rRatio > 0.3) {
        r = colB[0]; g = colB[1]; b = colB[2];
      }

      this.particles[i] = {
        x: tx + (Math.random() - 0.5) * 40,
        y: ty + (Math.random() - 0.5) * 40,
        z: tz + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        vz: 0,
        tx,
        ty,
        tz,
        r,
        g,
        b,
        tr: r,
        tg: g,
        tb: b,
      };
    }
  }

  public setMode(newMode: ShapeMode) {
    if (newMode === this.currentMode) return;
    this.currentMode = newMode;
    const count = this.particles.length;
    const targetCoords = generateShapePoints(newMode, count);

    const catalogItem = GESTURE_CATALOG.find((c) => c.id === newMode) || GESTURE_CATALOG[0];
    const colA = this.parseHexColor(catalogItem.colors[0]);
    const colB = this.parseHexColor(catalogItem.colors[1]);
    const colC = this.parseHexColor(catalogItem.colors[2]);

    // Deterministic 1-to-1 mapping
    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      p.tx = targetCoords[i * 3 + 0];
      p.ty = targetCoords[i * 3 + 1];
      p.tz = targetCoords[i * 3 + 2];

      const rRatio = (i % 3) / 2.0;
      if (rRatio > 0.6) {
        p.tr = colC[0]; p.tg = colC[1]; p.tb = colC[2];
      } else if (rRatio > 0.3) {
        p.tr = colB[0]; p.tg = colB[1]; p.tb = colB[2];
      } else {
        p.tr = colA[0]; p.tg = colA[1]; p.tb = colA[2];
      }
    }

    if (this.config.soundEnabled) {
      soundFx.playMorphSound(1.0);
    }
  }

  public updateHandAnchor(
    x: number,
    y: number,
    pitch: number = 0,
    roll: number = 0,
    isDetected: boolean = true
  ) {
    this.isHandLocked = isDetected;
    if (isDetected) {
      this.handVx = x - this.anchorX;
      this.handVy = y - this.anchorY;
      this.handPitch = pitch;
      this.handRoll = roll;
    } else {
      this.handVx *= 0.8;
      this.handVy *= 0.8;
      this.handPitch *= 0.9;
      this.handRoll *= 0.9;
    }
  }

  public updatePhysics() {
    this.smoothAnchorX = this.width / 2;
    this.smoothAnchorY = this.height / 2;

    // Continuous 3D rotation
    this.rotYaw += this.config.rotationSpeed;
    this.rotPitch += this.config.rotationSpeed * 0.2;

    const totalYaw = this.rotYaw;
    const totalPitch = this.rotPitch;

    const cy = Math.cos(totalYaw);
    const sy = Math.sin(totalYaw);
    const cp = Math.cos(totalPitch);
    const sp = Math.sin(totalPitch);

    // Rotation Matrix R = Ryaw * Rpitch
    const r00 = cy;
    const r01 = sy * sp;
    const r02 = sy * cp;
    const r10 = 0;
    const r11 = cp;
    const r12 = -sp;
    const r20 = -sy;
    const r21 = cy * sp;
    const r22 = cy * cp;

    const k = this.config.springK;
    const damp = this.config.damping;

    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      // Rotate target coordinates
      const rx = p.tx * r00 + p.ty * r01 + p.tz * r02;
      const ry = p.tx * r10 + p.ty * r11 + p.tz * r12;
      const rz = p.tx * r20 + p.ty * r21 + p.tz * r22;

      // Critically damped spring force (Zero jitter, smooth ease-in-out)
      const fx = (rx - p.x) * k;
      const fy = (ry - p.y) * k;
      const fz = (rz - p.z) * k;

      p.vx = p.vx * damp + fx;
      p.vy = p.vy * damp + fy;
      p.vz = p.vz * damp + fz;

      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Smooth color morph
      p.r += (p.tr - p.r) * 0.12;
      p.g += (p.tg - p.g) * 0.12;
      p.b += (p.tb - p.b) * 0.12;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const fov = this.config.fov;
    const cx = this.smoothAnchorX;
    const cy = this.smoothAnchorY;
    const len = this.particles.length;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      // Perspective Projection
      const zProjected = p.z + 360;
      const zSafe = Math.max(zProjected, 30);
      const scale = fov / (fov + zSafe);

      const sx = cx + p.x * scale;
      const sy = cy + p.y * scale;

      if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;

      // Responsive, noticeably larger and more visible particle size
      const baseRadius = Math.max(2.4, (h / 720) * 2.8);
      const radius = scale > 0.65 ? baseRadius * 1.35 : baseRadius;

      ctx.fillStyle = `rgb(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Soft bloom halo for enhanced 3D prominence
      if (this.config.bloomEnabled && (i % 3 === 0)) {
        ctx.fillStyle = `rgba(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)}, 0.28)`;
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
