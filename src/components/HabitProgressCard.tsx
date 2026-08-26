'use client';

import { TrendingUp } from 'lucide-react';

export default function HabitProgressCard() {
  const habits = [
    { id: 1, name: 'Exercise', streak: 15, total: 30, completedToday: true },
    { id: 2, name: 'Reading', streak: 8, total: 30, completedToday: false },
    { id: 3, name: 'Meditation', streak: 22, total: 30, completedToday: true },
    { id: 4, name: 'Journaling', streak: 5, total: 30, completedToday: false },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Habit Progress</h2>
        <button className="button-ghost">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  {habit.id === 1 && <span className="text-primary">💪</span>}
                  {habit.id === 2 && <span className="text-primary">📚</span>}
                  {habit.id === 3 && <span className="text-primary">🧘</span>}
                  {habit.id === 4 && <span className="text-primary">📝</span>}
                </div>
                <div>
                  <span className="font-medium">{habit.name}</span>
                  <span className="text-xs text-muted block">
                    {habit.completedToday ? '✓ Done today' : '○ Not done'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{habit.streak}</span>
                <span className="text-xs">days</span>
              </div>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-success rounded-full h-2" 
                style={{ width: `${(habit.streak / habit.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}