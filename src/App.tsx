import React, { useState } from 'react';
import { ShapeMode, SimulationConfig } from './types';
import { SimulationCanvas } from './components/SimulationCanvas';
import { GestureSelector } from './components/GestureSelector';
import { CodeViewer } from './components/CodeViewer';
import { GestureReference } from './components/GestureReference';
import { Sparkles, Terminal, BookOpen, Layers, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'code' | 'gestures'>('studio');
  const [currentMode, setCurrentMode] = useState<ShapeMode>('SATURN');

  const [config, setConfig] = useState<SimulationConfig>({
    particleCount: 4200,
    fov: 650,
    springK: 0.075,
    damping: 0.86,
    noiseStrength: 1.4,
    rotationSpeed: 0.022,
    bloomEnabled: true,
    arOverlay: true,
    soundEnabled: true,
    showLandmarks: true,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  AR 3D Particle Dust Simulation
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  OpenCV • MediaPipe • NumPy
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Webcam gesture tracking with continuous 3D rotation, magnetic spring suction & perspective depth
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              id="tab-studio"
              onClick={() => setActiveTab('studio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'studio'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Live Studio
            </button>

            <button
              id="tab-code"
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              main.py
            </button>

            <button
              id="tab-gestures"
              onClick={() => setActiveTab('gestures')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'gestures'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Gestures
            </button>
          </div>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'studio' && (
          <div className="space-y-4">
            {/* Primary AR Simulation Canvas */}
            <div className="w-full h-[580px] sm:h-[660px]">
              <SimulationCanvas
                currentMode={currentMode}
                onModeChange={setCurrentMode}
                config={config}
                onConfigChange={setConfig}
              />
            </div>

            {/* Gesture Selection Dock */}
            <GestureSelector
              currentMode={currentMode}
              onSelectMode={setCurrentMode}
            />
          </div>
        )}

        {activeTab === 'code' && (
          <CodeViewer />
        )}

        {activeTab === 'gestures' && (
          <GestureReference
            currentMode={currentMode}
            onSelectMode={(mode) => {
              setCurrentMode(mode);
              setActiveTab('studio');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 bg-slate-950/50 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Augmented Reality 3D Particle Dust Simulation • Python OpenCV + MediaPipe Hands + NumPy Engine
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('code')}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Download main.py</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
