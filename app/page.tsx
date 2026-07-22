import { cookies } from "next/headers";
import LoginOptions from "@/components/login";
import { createClient } from "@/utils/supabase/server";
import CreateNewWorkoutForm from "@/components/createWorkout";

export default async function Home() {
  const cookieStore = await cookies();
  const database = createClient(cookieStore);
  const [userData, exerciseListData, workoutListData] = await Promise.all([
    database.auth.getUser(),
    database.from("Exercises").select("id, name, group"),
    database
      .from("Workouts")
      .select("id, name, startTime, endTime, userId, workoutTemplateId"),
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
    <div className="flex justify-center p-2 bg-zinc-950 min-h-screen">
      <CreateNewWorkoutForm
        exerciseList={
          exerciseList as { id: number; name: string; group: string }[]
        }
      />
    </div>
  );
}
