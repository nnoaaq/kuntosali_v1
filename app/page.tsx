import { cookies } from "next/headers";
import LoginOptions from "@/components/login";
import { createClient } from "@/utils/supabase/server";
import CreateNewWorkoutForm from "@/components/createWorkout";
import { WorkoutList } from "@/components/listWorkouts";
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
export default async function Home() {
  const cookieStore = await cookies();
  const database = createClient(cookieStore);
  const [userData, exerciseListData, workoutListData] = await Promise.all([
    database.auth.getUser(),
    database.from("Exercises").select("id, name, group"),
    database
      .from("Workouts")
      .select(
        `id, name,startTime,endTime, exercises: WorkoutExercises(
      id,exercise:Exercises(id,name),
      sets: WorkoutSets(
      id, reps,weight,order
      )
      )`,
      )
      .order("startTime", { ascending: false }),
  ]);
  const { data: exerciseList, error: exerciseListError } = exerciseListData;
  if (exerciseListError) {
    // Renderöidään tyhjällä taulukolla
  }
  const { data: workoutList, error: workoutListError } = workoutListData;
  if (workoutListError) {
    // Renderöidään tyhjällä taulukolla
  }
  if (userData.error) {
    return <LoginOptions />;
  }

  return (
    <div className="flex flex-col gap-2 items-center p-2 bg-zinc-950 min-h-screen">
      <CreateNewWorkoutForm
        exerciseList={
          exerciseList as { id: number; name: string; group: string }[]
        }
      />
      <WorkoutList workoutList={workoutList as unknown as WorkoutListData[]} />
    </div>
  );
}
