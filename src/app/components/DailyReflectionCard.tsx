'use client';

import { Moon, Sun } from 'lucide-react';

export default function DailyReflectionCard() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daily Reflection</h2>
        <button className="button-ghost">
          New Entry
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Mood Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">How was your day?</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button 
                  key={rating}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg 
                           ${rating >= 4 ? 'bg-success/20 text-success' : 
                             rating >= 3 ? 'bg-warning/20 text-warning' : 
                             'bg-border/20 text-muted'}`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted">
            Rate your day from 1 (low energy) to 5 (great day)
          </p>
        </div>
        
        {/* Reflection Prompt */}
        <div className="space-y-2">
          <p className="text-sm font-medium mb-1">Today's Prompt:</p>
          <p className="text-muted italic">
            What's one small win you had today, and what's one thing you'd improve tomorrow?
          </p>
          <textarea 
            placeholder="Write your reflection..."
            className="textarea w-full h-32"
          />
        </div>
        
        {/* Quick Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">23</div>
              <p className="text-xs text-muted">Day Streak</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">4.2</div>
              <p className="text-xs text-muted">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}