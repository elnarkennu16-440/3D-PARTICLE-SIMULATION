import React, { useState } from 'react';
import { PYTHON_MAIN_SOURCE, PYTHON_BUILD_ASSETS_SOURCE } from '../data/pythonSource';
import { Copy, Check, Download, Terminal, FileCode, Sparkles, Layers, Cpu, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'main' | 'build'>('main');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPip, setCopiedPip] = useState<boolean>(false);
  const [copiedBuildCmd, setCopiedBuildCmd] = useState<boolean>(false);
  const [copiedMainCmd, setCopiedMainCmd] = useState<boolean>(false);

  const currentSource = activeFile === 'main' ? PYTHON_MAIN_SOURCE : PYTHON_BUILD_ASSETS_SOURCE;
  const currentFileName = activeFile === 'main' ? 'main.py' : 'build_assets.py';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentSource);
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyPip = async () => {
    try {
      await navigator.clipboard.writeText('pip install pygame PyOpenGL PyOpenGL_accelerate opencv-python mediapipe numpy');
      setCopiedPip(true);
      setTimeout(() => setCopiedPip(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentSource], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* 2-Script Pipeline Architecture Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2-Script Architecture: Zero Wireframe Boxes • 100% Pure Particles
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Asset preparation (<code className="text-amber-300">build_assets.py</code>) is completely separated from the real-time render loop (<code className="text-cyan-300">main.py</code>) for zero runtime overhead and pristine stardust rendering.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="download-active-py-btn"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              Download {currentFileName}
            </button>
            <button
              id="copy-active-py-btn"
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 flex items-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Code!' : `Copy ${currentFileName}`}
            </button>
          </div>
        </div>

        {/* 3-Step Local Execution Commands */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* Step 1: pip install */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-slate-500 shrink-0">1.</span>
              <span className="text-emerald-400 text-[11px] truncate">pip install pygame PyOpenGL opencv-python mediapipe numpy</span>
            </div>
            <button
              onClick={handleCopyPip}
              className="text-slate-400 hover:text-white p-1 rounded transition ml-2 shrink-0"
              title="Copy pip command"
            >
              {copiedPip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Step 2: python build_assets.py */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 shrink-0">2.</span>
              <span className="text-amber-400 font-bold">python build_assets.py</span>
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText('python build_assets.py');
                setCopiedBuildCmd(true);
                setTimeout(() => setCopiedBuildCmd(false), 2000);
              }}
              className="text-slate-400 hover:text-white p-1 rounded transition ml-2 shrink-0"
              title="Copy build command"
            >
              {copiedBuildCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Step 3: python main.py */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 shrink-0">3.</span>
              <span className="text-cyan-400 font-bold">python main.py</span>
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText('python main.py');
                setCopiedMainCmd(true);
                setTimeout(() => setCopiedMainCmd(false), 2000);
              }}
              className="text-slate-400 hover:text-white p-1 rounded transition ml-2 shrink-0"
              title="Copy run command"
            >
              {copiedMainCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-rose-400">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Zero Debug Boxes & Squares</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All wireframe cubes, HUD rectangles, tracking grids, and axis indicator squares have been stripped completely. Only pure glowing stardust (<code className="text-rose-300">GL_POINTS</code>) is rendered on deep space black.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Cpu className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Pre-Baked 3D NPZ Archive</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <code className="text-amber-300">build_assets.py</code> processes 2D images once via Euclidean distance transforms and writes closed 360° point clouds to <code className="text-amber-300">assets/models_3d.npz</code>.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Steady 60 FPS GPU Loop</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Critically damped spring dynamics (<code className="text-cyan-300">damping: 0.84</code>, <code className="text-cyan-300">spring: 0.08</code>) with continuous turntable rotation (<code className="text-cyan-300">yaw += 0.007</code>) with zero CPU image parsing bottlenecks.
          </p>
        </div>
      </div>

      {/* Code Editor / Viewer Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Code Header Bar with File Switcher Tabs */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* File Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                id="file-tab-main-py"
                onClick={() => setActiveFile('main')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                  activeFile === 'main'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                main.py
                <span className="text-[9px] font-sans font-normal opacity-80">(Simulation Engine)</span>
              </button>

              <button
                id="file-tab-build-py"
                onClick={() => setActiveFile('build')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                  activeFile === 'build'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                build_assets.py
                <span className="text-[9px] font-sans font-normal opacity-80">(One-time Baker)</span>
              </button>
            </div>
          </div>

          <button
            id="copy-code-btn"
            onClick={handleCopyCode}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : `Copy ${currentFileName}`}
          </button>
        </div>

        {/* Code Body */}
        <pre className="p-5 text-xs font-mono leading-relaxed text-slate-300 overflow-x-auto max-h-[600px] overflow-y-auto selection:bg-cyan-500/30 selection:text-white">
          <code>{currentSource}</code>
        </pre>
      </div>
    </div>
  );
};
