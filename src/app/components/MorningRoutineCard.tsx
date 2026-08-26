'use client';

import { CheckSquare2 } from 'lucide-react';

export default function MorningRoutineCard() {
  const routines = [
    { id: 1, name: 'Meditation', time: '10 min', completed: true },
    { id: 2, name: 'Hydration', time: '500ml', completed: true },
    { id: 3, name: 'Journal', time: '5 min', completed: false },
    { id: 4, name: 'Stretch', time: '5 min', completed: false },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Morning Routine</h2>
        <button className="button-ghost">
          Edit
        </button>
      </div>
      
      <div className="space-y-3">
        {routines.map((routine) => (
          <div key={routine.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                {routine.id === 1 && <span className="text-primary">🧘</span>}
                {routine.id === 2 && <span className="text-primary">💧</span>}
                {routine.id === 3 && <span className="text-primary">📝</span>}
                {routine.id === 4 && <span className="text-primary">🤸</span>}
              </div>
              <div>
                <span className="font-medium">{routine.name}</span>
                <span className="text-xs text-muted block">{routine.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {routine.completed && (
                <CheckSquare2 className="h-4 w-4 text-success" />
              )}
              {!routine.completed && (
                <button 
                  className="button-ghost p-1"
                  onClick={() => alert('Mark as complete')}
                >
                  Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}