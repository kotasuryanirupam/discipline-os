'use client';

import { useState } from 'react';

export default function HeroCard() {
  const [streak, setStreak] = useState(23);
  const [score, setScore] = useState(85);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Good Morning, Champion
          </h1>
          <p className="text-sm text-muted">
            Today's Discipline Score: <span className="text-primary">{score}%</span>
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{streak}</span>
            <span className="text-xs text-muted">day streak</span>
          </div>
          <div className="mt-2">
            <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
              <span className="text-primary">🔥</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">Morning Routine</span>
          <button className="button-ghost">
            Start Routine
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-primary">🧘</span>
            </div>
            <div>
              <span className="font-medium">Meditation</span>
              <span className="text-xs text-muted block">10 min</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-primary">💧</span>
            </div>
            <div>
              <span className="font-medium">Hydration</span>
              <span className="text-xs text-muted block">500ml</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">Focus Sessions</span>
          <button className="button-ghost">
            View All
          </button>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span>Deep Work Block</span>
            <span className="text-success font-medium">2.5h</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div className="bg-success rounded-full h-2" style={{ width: '83%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}