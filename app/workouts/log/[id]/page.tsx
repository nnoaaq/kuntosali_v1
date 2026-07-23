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
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const database = createClient(cookieStore);
  // Supabasessa on RLS Policy, joka antaa nähdä vain omat workoutit

  const { data: workoutData, error: workoutError } = await database
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
  if (workoutError) return console.error(workoutError);
  if (!workoutData) notFound(); // Joko treeniä ei ole olemassa tai treeni kuuluu toiselle.
  return (
    <div className="flex justify-center w-full min-h-screen bg-zinc-950">
      <LogWorkout workout={workoutData as unknown as WorkoutData} />
    </div>
  );
}
