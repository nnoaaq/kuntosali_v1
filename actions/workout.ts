"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface WorkoutData {
  name: string;
  exercises: {
    exerciseId: number;
    sets: {
      id: number;
      reps: number;
      weight: number;
      order: number;
    }[];
  }[];
}
export async function saveWorkoutData(workoutData: WorkoutData) {
  const cookieStore = await cookies();
  const database = createClient(cookieStore);

  const { data: createdWorkoutId, error: createWorkoutError } =
    await database.rpc("saveworkout", { workout: workoutData });
  if (createWorkoutError) {
    console.error(createWorkoutError);
    return;
  }
  redirect(`/workouts/log/${createdWorkoutId}`);
}
export async function finishWorkoutData(workoutData: {
  workout: {
    id: number;
    exercises: {
      id: number;
      exercise: { id: number; name: string };
      sets: {
        id: number;
        finished: boolean;
        order: number;
        reps: number;
        weight: number;
      }[];
    }[];
  };
}) {
  const cookieStore = await cookies();
  const database = createClient(cookieStore);

  const { data: finishedWorkoutId, error: finishWorkoutError } =
    await database.rpc("finishworkout", {
      workoutid: workoutData.workout.id,
      exercises: workoutData.workout.exercises,
    });

  if (finishWorkoutError) return console.error(finishWorkoutError);
  return finishedWorkoutId;
}
