import React from 'react';
import { ShapeMode } from '../types';
import { GESTURE_CATALOG } from '../math/shapes3d';

interface GestureSelectorProps {
  currentMode: ShapeMode;
  onSelectMode: (mode: ShapeMode) => void;
}

export const GestureSelector: React.FC<GestureSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            3D Morph Formations
          </span>
          <span className="text-[11px] text-slate-500">
            (Press keys 0-9, C for Cobra, or show gesture to webcam)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
        {GESTURE_CATALOG.map((item, index) => {
          const isActive = item.id === currentMode;
          return (
            <button
              key={item.id}
              id={`gesture-button-${item.id.toLowerCase()}`}
              onClick={() => onSelectMode(item.id)}
              className={`relative group p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col items-center sm:items-start justify-between min-h-[82px] ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              {/* Header with Key Badge and Icon */}
              <div className="w-full flex items-center justify-between mb-1">
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {item.handIcon}
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 font-bold">
                  {index < 10 ? index : 'C'}
                </kbd>
              </div>

              {/* Title & Gesture description */}
              <div className="w-full">
                <p className="text-[11px] font-bold text-white truncate w-full">
                  {item.name}
                </p>
                <p className="text-[9px] text-slate-400 truncate w-full font-mono">
                  {item.gestureName}
                </p>
              </div>

              {/* Active neon accent pill */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: item.accentHex }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
