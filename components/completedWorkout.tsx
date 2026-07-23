"use client";

import { formatTime } from "@/utils/time";
import { useState } from "react";

export function CompletedWorkout({
  workout,
}: {
  workout: {
    id: number;
    name: string;
    startTime: string;
    endTime: string | null;
    exercises: {
      id: number;
      sets: { id: number; reps: number; weight: number; order: number }[];
      exercise: { id: number; name: string };
    }[];
  };
}) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div
      key={workout.id}
      className="text-zinc-500 border border-zinc-800 p-2 rounded"
    >
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="flex justify-between"
      >
        <div>
          <p className="text-zinc-400 uppercase ">{workout.name}</p>
          <p className="text-zinc-600 uppercase text-sm">
            {formatTime(workout.startTime)}
          </p>
        </div>
        <div className="cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`size-6 ${showDetails && "rotate-180"} transition duration-200 text-amber-500`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>
      {showDetails &&
        workout.exercises.map((exercise) => (
          <div key={exercise.id}>
            {exercise.exercise.name}
            <div>
              <div className="flex gap-2 mt-1.5 flex-nowrap">
                {exercise.sets
                  .sort((a, b) => a.order - b.order) // varmennetaan että ovat oikeassa järjestyksessä...
                  .map((set) => (
                    <div key={set.id}>
                      <p className="border border-zinc-800 bg-zinc-800/20 p-2 rounded ">
                        {set.reps} x {set.weight} kg
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
