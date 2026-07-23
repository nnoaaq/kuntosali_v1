"use client";

import { formatTime } from "@/utils/time";
import { CompletedWorkout } from "./completedWorkout";

interface WorkoutListData {
  id: number;
  name: string;
  startTime: string;
  endTime: string | null;
  exercises: {
    id: number;
    sets: { id: number; reps: number; weight: number; order: number }[];
    exercise: { id: number; name: string };
  }[];
}

export function WorkoutList({
  workoutList,
}: {
  workoutList: WorkoutListData[];
}) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-zinc-900 text-zinc-100 rounded-lg p-2 flex flex-col gap-2">
        <h1 className="text-xl text-amber-500">Suoritetut treenit</h1>
        <div className="flex flex-col gap-2">
          {workoutList.map((workout) => (
            <CompletedWorkout workout={workout} key={workout.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
