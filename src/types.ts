/**
 * Types & Constants for AR 3D Particle Dust Simulation
 */

export type ShapeMode =
  | 'IDLE'
  | 'SATURN'
  | 'WORMHOLE'
  | 'FACE'
  | 'DRAGON'
  | 'HEART'
  | 'BUILDING'
  | 'MOUNTAIN'
  | 'CITY'
  | 'BLACKHOLE'
  | 'TEXT'
  | 'COBRA';

export interface GestureInfo {
  id: ShapeMode;
  name: string;
  gestureName: string;
  triggerDescription: string;
  handIcon: string;
  badgeColor: string;
  accentHex: string;
  formulaDescription: string;
}

export interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  tx: number; // Target X
  ty: number; // Target Y
  tz: number; // Target Z
  r: number;
  g: number;
  b: number;
  baseSize: number;
}

export interface HandLandmark {
  x: number; // 0 to 1
  y: number; // 0 to 1
  z?: number;
}

export interface SimulationConfig {
  particleCount: number;
  fov: number;
  springK: number;
  damping: number;
  noiseStrength: number;
  rotationSpeed: number;
  bloomEnabled: boolean;
  arOverlay: boolean;
  soundEnabled: boolean;
  showLandmarks: boolean;
}
