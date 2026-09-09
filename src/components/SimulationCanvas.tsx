import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ShapeMode, SimulationConfig } from '../types';
import { ParticleEngine } from '../engine/particleEngine';
import { BrowserHandTracker } from '../engine/handTracker';
import { GESTURE_CATALOG } from '../math/shapes3d';
import { soundFx } from '../audio/soundEffects';
import {
  Camera,
  CameraOff,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  RefreshCw,
  Sliders,
  Maximize2,
  Minimize2,
  Radio,
} from 'lucide-react';

interface SimulationCanvasProps {
  currentMode: ShapeMode;
  onModeChange: (mode: ShapeMode) => void;
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  currentMode,
  onModeChange,
  config,
  onConfigChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const engineRef = useRef<ParticleEngine | null>(null);
  const trackerRef = useRef<BrowserHandTracker>(new BrowserHandTracker());
  const reqIdRef = useRef<number | null>(null);

  // Status & Metrics
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [isHandLocked, setIsHandLocked] = useState<boolean>(false);
  const [detectedGesture, setDetectedGesture] = useState<ShapeMode>('IDLE');
  const [isDraggingHand, setIsDraggingHand] = useState<boolean>(false);
  const [virtualHandPos, setVirtualHandPos] = useState<{ x: number; y: number }>({ x: 640, y: 360 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Initialize Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width || 1280;
    const height = canvas.height || 720;
    const engine = new ParticleEngine(width, height);
    engine.config = { ...config };
    engine.setMode(currentMode);
    engineRef.current = engine;

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, []);

  // Update engine config when prop changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.config = { ...config };
      soundFx.setEnabled(config.soundEnabled);
    }
  }, [config]);

  // Sync mode changes from outside
  useEffect(() => {
    if (engineRef.current && engineRef.current.currentMode !== currentMode) {
      engineRef.current.setMode(currentMode);
      setDetectedGesture(currentMode);
    }
  }, [currentMode]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      if (engineRef.current) {
        engineRef.current.resize(canvas.width, canvas.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Shortcuts (0-8, A, B, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        const idx = parseInt(e.key, 10);
        const item = GESTURE_CATALOG[idx];
        if (item) {
          onModeChange(item.id);
        }
      } else if (e.key === 'c' || e.key === 'C' || e.key === 's' || e.key === 'S') {
        onModeChange('COBRA');
      } else if (e.key === 'a' || e.key === 'A') {
        onConfigChange({ ...config, arOverlay: !config.arOverlay });
      } else if (e.key === 'b' || e.key === 'B') {
        onConfigChange({ ...config, bloomEnabled: !config.bloomEnabled });
      } else if (e.key === 'r' || e.key === 'R') {
        if (engineRef.current) {
          engineRef.current.initParticles();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, onConfigChange, onModeChange]);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: unknown) {
      console.error('Camera access failed:', err);
      setCameraError('Webcam permission denied or unavailable. Virtual Hand mode is active.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Main Render & Physics Loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const loop = (time: number) => {
      reqIdRef.current = requestAnimationFrame(loop);

      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (!canvas || !engine) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // FPS tracking
      frameCount++;
      if (time - fpsTimer >= 500) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }
      lastTime = time;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Clear Canvas with pure dark cosmic void
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Step Physics & Render 3D Particles at Center
      engine.updatePhysics();
      engine.render(ctx);

      // Render Top-Right Webcam PIP Inset on Canvas if active (Significantly enlarged & more visible)
      if (cameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        const pipW = Math.min(canvas.width * 0.42, Math.max(360, canvas.width * 0.36));
        const pipH = (pipW * 9) / 16;
        const pipX = canvas.width - pipW - 24;
        const pipY = 24;

        ctx.save();
        // Cyber Glowing Border
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
        ctx.shadowBlur = 8;
        ctx.strokeRect(pipX - 1, pipY - 1, pipW + 2, pipH + 2);
        ctx.shadowBlur = 0;

        // Clip and draw mirrored webcam frame
        ctx.save();
        ctx.beginPath();
        ctx.rect(pipX, pipY, pipW, pipH);
        ctx.clip();

        ctx.translate(pipX + pipW, pipY);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, pipW, pipH);
        ctx.restore();

        // High Visibility Label Tag
        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        ctx.fillRect(pipX, pipY, 130, 24);
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('● LIVE WEBCAM PIP', pipX + 10, pipY + 16);
        ctx.restore();
      }

      // Virtual Hand or Anchor Indicator
      if (isDraggingHand || (!cameraActive && engine.isHandLocked)) {
        const hx = engine.smoothAnchorX;
        const hy = engine.smoothAnchorY;

        ctx.save();
        ctx.strokeStyle = 'rgba(60, 220, 255, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(hx, hy, 28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(60, 220, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(180, 230, 255, 0.75)';
        ctx.fillText('HAND ANCHOR (0,0,0)', hx + 34, hy + 4);
        ctx.restore();
      }
    };

    reqIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [cameraActive, config.arOverlay, isDraggingHand]);

  // Mouse / Touch Virtual Hand Interactivity
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDraggingHand(true);
    setVirtualHandPos({ x, y });
    setIsHandLocked(true);

    const pitch = ((y / canvas.height) - 0.5) * 1.5;
    const roll = ((x / canvas.width) - 0.5) * 1.5;
    engineRef.current.updateHandAnchor(x, y, pitch, roll, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingHand && !e.buttons) return;
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setVirtualHandPos({ x, y });
    const pitch = ((y / canvas.height) - 0.5) * 1.5;
    const roll = ((x / canvas.width) - 0.5) * 1.5;
    engineRef.current.updateHandAnchor(x, y, pitch, roll, true);
  };

  const handlePointerUp = () => {
    setIsDraggingHand(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const activeCatalog = GESTURE_CATALOG.find((g) => g.id === currentMode) || GESTURE_CATALOG[0];

  return (
    <div
      ref={containerRef}
      id="simulation-container"
      className="relative w-full h-full min-h-[500px] max-h-[780px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
    >
      {/* Hidden Video for Webcam Tracking */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        width={1280}
        height={720}
      />

      {/* Primary 3D AR Canvas */}
      <canvas
        ref={canvasRef}
        id="ar-simulation-canvas"
        className="w-full h-full flex-1 cursor-crosshair touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Cyber HUD Overlay Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
        {/* Active Mode & Hand Lock Badge */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 px-4 shadow-xl flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner border border-white/10"
            style={{ backgroundColor: `${activeCatalog.accentHex}20` }}
          >
            {activeCatalog.handIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Active Formation
              </span>
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                {isHandLocked || cameraActive ? 'ANCHOR LOCKED' : 'FREE SPIN'}
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              {activeCatalog.name}
            </h2>
          </div>
        </div>

        {/* Telemetry & Quick Action Bar */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* FPS & Particle Count Pill */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 flex items-center gap-3 shadow-lg">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${fps >= 45 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {fps} FPS
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{config.particleCount.toLocaleString()} pts</span>
          </div>

          {/* WebCam Toggle Button */}
          <button
            id="camera-toggle-btn"
            onClick={cameraActive ? stopCamera : startCamera}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-lg flex items-center gap-2 text-xs font-medium ${
              cameraActive
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-slate-900/85 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
            title={cameraActive ? 'Turn off webcam' : 'Enable webcam for real-time AR'}
          >
            {cameraActive ? <Camera className="w-4 h-4 text-emerald-400" /> : <CameraOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{cameraActive ? 'AR Active' : 'Start Camera'}</span>
          </button>

          {/* Settings Drawer Toggle */}
          <button
            id="sim-settings-toggle"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-700/60 text-slate-300 hover:bg-slate-800 backdrop-blur-md transition shadow-lg"
            title="Particle & Physics Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-700/60 text-slate-300 hover:bg-slate-800 backdrop-blur-md transition shadow-lg"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Camera Error / Fallback Notice */}
      {cameraError && (
        <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-4 max-w-sm z-20 bg-amber-950/90 border border-amber-600/40 text-amber-200 text-xs p-3 rounded-xl shadow-xl flex items-center justify-between gap-2">
          <span>{cameraError}</span>
          <button
            onClick={() => setCameraError(null)}
            className="text-amber-400 hover:text-white font-bold text-sm px-1.5"
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Instructions Bottom Pill */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-10 flex items-center gap-2">
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-300 shadow-xl flex items-center gap-2">
          <span className="text-amber-400 font-bold">PRO-TIP:</span>
          <span>Click & drag inside canvas to move the 3D Hand Anchor & tilt parallax!</span>
        </div>
      </div>

      {/* Quick Controls Bottom Right */}
      <div className="absolute bottom-4 right-4 pointer-events-auto z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 shadow-xl">
        <button
          id="toggle-ar-mode"
          onClick={() => onConfigChange({ ...config, arOverlay: !config.arOverlay })}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
            config.arOverlay
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle AR Camera Feed vs Deep Cosmic Space"
        >
          <Eye className="w-3.5 h-3.5" />
          {config.arOverlay ? 'AR Feed' : 'Void Mode'}
        </button>

        <button
          id="toggle-bloom-mode"
          onClick={() => onConfigChange({ ...config, bloomEnabled: !config.bloomEnabled })}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
            config.bloomEnabled
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Glowing Dust Bloom"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Bloom
        </button>

        <button
          id="toggle-sound-mode"
          onClick={() => {
            const next = !config.soundEnabled;
            onConfigChange({ ...config, soundEnabled: next });
            soundFx.setEnabled(next);
            if (next) soundFx.playMorphSound(0.7);
          }}
          className={`p-1.5 rounded-lg text-xs transition ${
            config.soundEnabled ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Audio Feedback"
        >
          {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          id="reset-particles-btn"
          onClick={() => {
            if (engineRef.current) {
              engineRef.current.initParticles();
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Scatter & Reset Particles"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Sliding Settings Drawer */}
      {showSettingsDrawer && (
        <div className="absolute top-16 right-4 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-30 text-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Physics & Engine Controls
            </h3>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5"
            >
              ×
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Particle Count</span>
                <span className="font-mono text-cyan-400">{config.particleCount}</span>
              </div>
              <input
                type="range"
                min={1500}
                max={5000}
                step={250}
                value={config.particleCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onConfigChange({ ...config, particleCount: val });
                  if (engineRef.current) {
                    engineRef.current.config.particleCount = val;
                    engineRef.current.initParticles();
                  }
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Magnetic Suction (Spring K)</span>
                <span className="font-mono text-cyan-400">{config.springK.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={0.20}
                step={0.005}
                value={config.springK}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onConfigChange({ ...config, springK: val });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Fluid Velocity Damping</span>
                <span className="font-mono text-cyan-400">{config.damping.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.70}
                max={0.96}
                step={0.01}
                value={config.damping}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onConfigChange({ ...config, damping: val });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">3D Rotation Speed</span>
                <span className="font-mono text-cyan-400">{config.rotationSpeed.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.005}
                max={0.060}
                step={0.002}
                value={config.rotationSpeed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onConfigChange({ ...config, rotationSpeed: val });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Curl Turbulence Noise</span>
                <span className="font-mono text-cyan-400">{config.noiseStrength.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={4.0}
                step={0.2}
                value={config.noiseStrength}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onConfigChange({ ...config, noiseStrength: val });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
