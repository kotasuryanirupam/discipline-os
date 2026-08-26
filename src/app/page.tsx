import HeroCard from '@/components/HeroCard';
import MorningRoutineCard from '@/components/MorningRoutineCard';
import HabitProgressCard from '@/components/HabitProgressCard';
import WorkoutFocusCard from '@/components/WorkoutFocusCard';
import DailyReflectionCard from '@/components/DailyReflectionCard';

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <HeroCard />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 lg:col-span-8">
          <MorningRoutineCard />
          <WorkoutFocusCard />
        </div>
        <div className="col-span-6 lg:col-span-4">
          <HabitProgressCard />
          <DailyReflectionCard />
        </div>
      </div>
    </div>
  );
}