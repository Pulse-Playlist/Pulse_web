'use client';

import React from 'react';
import { Sliders, Gauge, RotateCcw } from 'lucide-react';
import { getCadenceZone } from '@/lib/utils';

interface CadenceFilterProps {
  enabled: boolean;
  cadence: number;
  tolerance: number;
  onCadenceChange: (value: number) => void;
  onToleranceChange: (tol: number) => void;
  onToggleEnabled: (enabled: boolean) => void;
}

export const CadenceFilter: React.FC<CadenceFilterProps> = ({
  enabled,
  cadence,
  tolerance,
  onCadenceChange,
  onToleranceChange,
  onToggleEnabled,
}) => {
  const presets = [
    { label: 'Warmup 140', value: 140 },
    { label: 'Aerobic 155', value: 155 },
    { label: 'Easy 165', value: 165 },
    { label: 'Marathon 175', value: 175 },
    { label: 'Sprint 185', value: 185 },
  ];

  const zone = getCadenceZone(cadence);
  const minRange = Math.max(0, cadence - tolerance);
  const maxRange = cadence + tolerance;

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                RUNNING CADENCE FILTER
              </h2>
              {enabled ? (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${zone.bgColor} ${zone.textColor} ${zone.borderColor}`}>
                  {zone.label}
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  All Cadences
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Filter songs matching your running stride steps-per-minute (SPM)
            </p>
          </div>
        </div>

        {/* Toggle & Reset */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => onToggleEnabled(!enabled)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              enabled
                ? 'bg-brand-500 text-zinc-950 font-bold shadow-md shadow-brand-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {enabled ? 'Active (SPM Match)' : 'Filter by Cadence'}
          </button>
          {enabled && (
            <button
              onClick={() => onToggleEnabled(false)}
              title="Reset cadence filter"
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Slider & Tolerance row */}
      <div className={`space-y-4 transition-opacity ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="text-zinc-400 font-medium flex items-center space-x-1">
              <Sliders className="h-3.5 w-3.5 text-zinc-400" />
              <span>Target Cadence:</span>
              <strong className="text-white text-base font-bold ml-1 font-display">
                {cadence} SPM
              </strong>
            </span>
            <span className="text-zinc-400">
              Target Window: <strong className="text-zinc-200">{minRange} – {maxRange} SPM</strong>
            </span>
          </div>

          <input
            type="range"
            min="110"
            max="195"
            step="1"
            value={cadence}
            onChange={(e) => onCadenceChange(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>110 SPM</span>
            <span className="text-sky-400">130 (Rec)</span>
            <span className="text-emerald-400">150 (Base)</span>
            <span className="text-lime-400">165 (Easy)</span>
            <span className="text-amber-400">175 (Marathon)</span>
            <span className="text-rose-400">185+ (Fast)</span>
            <span>195 SPM</span>
          </div>
        </div>

        {/* Presets and Tolerance buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
            <span className="text-[11px] font-medium text-zinc-400 mr-1">Presets:</span>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  onCadenceChange(p.value);
                  if (!enabled) onToggleEnabled(true);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  cadence === p.value
                    ? 'bg-zinc-200 text-zinc-950 font-bold'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Tolerance */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-medium text-zinc-400">Tolerance:</span>
            {[3, 5, 10].map((tol) => (
              <button
                key={tol}
                onClick={() => onToleranceChange(tol)}
                className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                  tolerance === tol
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-semibold'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ±{tol} SPM
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
