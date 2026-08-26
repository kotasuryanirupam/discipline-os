'use client';

import { Timer, Zap } from 'lucide-react';

export default function WorkoutFocusCard() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Workout & Focus</h2>
        <button className="button-ghost">
          Start Session
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Workout Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Today's Split</span>
            <span className="text-sm text-muted">Push Day</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-3 p-2 bg-surface-hover rounded-lg">
              <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary">💪</span>
              </div>
              <div>
                <span className="font-medium">Bench Press</span>
                <span className="text-xs text-muted block">3x8</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-surface-hover rounded-lg">
              <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary">🏋️</span>
              </div>
              <div>
                <span className="font-medium">Overhead Press</span>
                <span className="text-xs text-muted block">3x10</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border/my-4"></div>
        
        {/* Focus Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Focus Timer</span>
            <button className="button-ghost p-2">
              <Timer className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-5xl font-bold text-success">45:00</span>
            </div>
            <p className="text-sm text-muted uppercase">Deep Work Session</p>
            <div className="mt-4 flex justify-center space-x-3">
              <button className="button-ghost px-4 py-2 rounded-lg">
                Pause
              </button>
              <button className="button-primary px-4 py-2 rounded-lg">
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}