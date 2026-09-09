import React from 'react';
import { GESTURE_CATALOG } from '../math/shapes3d';
import { ShapeMode } from '../types';

interface GestureReferenceProps {
  currentMode: ShapeMode;
  onSelectMode: (mode: ShapeMode) => void;
}

export const GestureReference: React.FC<GestureReferenceProps> = ({
  currentMode,
  onSelectMode,
}) => {
  return (
    <div className="w-full space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-1">
          Hand Gesture & 3D Morph Formations Catalog
        </h3>
        <p className="text-xs text-slate-400">
          The MediaPipe Hands geometry tracks 21 skeletal coordinates to classify fingers, extensions, and proximities into 8 geometric morphing modes plus the default floating idle dust.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GESTURE_CATALOG.map((item, idx) => {
          const isActive = item.id === currentMode;
          return (
            <div
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    {item.handIcon}
                  </span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 font-bold">
                      Key {idx < 10 ? idx : 'C'}
                    </kbd>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.id}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{item.name}</h4>
                <div className="text-xs font-semibold text-cyan-400 mb-2">
                  Gesture: {item.gestureName}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {item.triggerDescription}
                </p>
              </div>

              {/* Color Palette Indicators */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">COLOR PALETTE</span>
                <div className="flex items-center gap-1.5">
                  {item.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
