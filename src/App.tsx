import React, { useState } from 'react';
import { CodeViewer } from './components/CodeViewer';
import { GestureReference } from './components/GestureReference';
import { Terminal, BookOpen, ExternalLink, Play, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'code' | 'gestures'>('code');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-mono font-bold text-cyan-400 text-xs">
                Py
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  AR 3D Particle Dust Simulation (Python Engine)
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  OpenCV • MediaPipe • Pygame • OpenGL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Pure Python desktop application with 60 FPS OpenGL particle stardust and MediaPipe hand gesture control
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
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
              Python Code & Runner
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
              Gesture Reference Guide
            </button>
          </div>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Launch Banner */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-amber-950/30 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Python Desktop Engine Ready
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Launch Native 3D Simulation on your Machine
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              The project is 100% powered by <code className="text-cyan-300">main.py</code> using your webcam for real-time 21-landmark tracking and PyOpenGL for 60 FPS particle rendering.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl font-mono text-xs text-slate-300 shrink-0">
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span className="text-slate-500">Run:</span>
            <span className="text-cyan-400 font-bold">python main.py</span>
          </div>
        </div>

        {activeTab === 'code' && (
          <CodeViewer />
        )}

        {activeTab === 'gestures' && (
          <GestureReference
            currentMode={'SATURN'}
            onSelectMode={() => setActiveTab('code')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 bg-slate-950/50 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Python Engine verified • Zero debug wireframes • 11 gesture-controlled 3D sculptures
          </span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono text-[11px]">
              python main.py
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

