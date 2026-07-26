import { LogWorkout } from "@/components/logWorkout";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
interface WorkoutData {
  id: number;
  name: string;
  startTime: string;
  endTime: string | null;
  exerciseList: {
    exercises: {
      id: number;
      exercise: { id: number; name: string };
      sets: {
        id: number;
        reps: number;
        order: number;
        weight: number;
      }[];
    }[];
  };
}
interface PreviousSets {
  id: number;
  exerciseId: number;
  workoutId: number;
  workout_name: string;
  workout_starttime: string;
  sets: {
    id: number;
    reps: number;
    weight: number;
    order: number;
    workoutExerciseId: number;
  }[];
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const database = createClient(cookieStore);

  const { data: rawWorkoutData, error: workoutError } = await database
    .from("Workouts")
    .select(
      `
      id,
      name,
      startTime,
      endTime,
      exerciseList: WorkoutTemplates!inner (
        exercises: WorkoutTemplateExercises (
          id,
          exercise: Exercises (
          id,name
          ),
          sets: WorkoutTemplateSets(
          id, reps, weight, order
          )
        )
      )
      `,
    )
    .eq("id", id)
    .maybeSingle();
  if (workoutError) {
    console.error(workoutError);
    return notFound();
  }
  if (!rawWorkoutData) return notFound(); // Joko treeniä ei ole olemassa tai treeni kuuluu toiselle.
  const workoutData = rawWorkoutData as unknown as WorkoutData;
  const exercises = [
    ...new Set(
      workoutData.exerciseList.exercises.map(
        (exercise) => exercise.exercise.id,
      ),
    ),
  ];
  const { data: previousSetsData, error: previousSetsError } =
    await database.rpc("latest_sets", {
      exercises: [1, 2],
    });
  let previousSets;
  if (previousSetsError) {
    previousSets = [];
    return;
  }
  previousSets = previousSetsData;
  console.log(">>>", previousSets);
  return (
    <div className="flex justify-center w-full min-h-screen bg-zinc-950">
      <LogWorkout
        workout={workoutData as unknown as WorkoutData}
        previousSets={previousSets as unknown as PreviousSets[]}
      />
    </div>
  );
}
