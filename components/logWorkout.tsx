"use client";

import { finishWorkoutData } from "@/actions/workout";
import { redirect } from "next/navigation";
import { useState } from "react";
import { WorkoutDuration } from "./WorkoutDuration";

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

export function LogWorkout({ workout }: { workout: WorkoutData }) {
  const [errors, setErrors] = useState<{ exercise: Number; text: string }[]>(
    [],
  );
  const [exercises, setExercises] = useState<
    {
      id: number;
      exercise: { id: number; name: string };
      sets: {
        id: number;
        reps: number;
        order: number;
        weight: number;
        finished: boolean;
      }[];
    }[]
  >(
    workout.exerciseList.exercises.map((exercise) => {
      return {
        ...exercise,
        sets: exercise.sets.map((set) => {
          return { ...set, finished: false };
        }),
      };
    }),
  );
  function addSet(exerciseId: number) {
    setExercises((prevExercises) =>
      prevExercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: Date.now(),
              reps: exercise.sets[exercise.sets.length - 1]?.reps || 0,
              order: exercise.sets.length + 1,
              weight: exercise.sets[exercise.sets.length - 1]?.weight || 0,
              finished: false,
            },
          ],
        };
      }),
    );
  }
  function removeSet(exerciseId: number, setId: number) {
    setExercises((prevExercises) =>
      prevExercises
        .map((exercise) => {
          if (exercise.id !== exerciseId) return exercise;
          return {
            ...exercise,
            sets: exercise.sets
              .filter((set) => set.id !== setId)
              .map((set, index) => {
                return { ...set, order: index + 1 };
              }),
          };
        })
        .filter((exercise) => exercise.sets.length > 0),
    );
  }
  function updateSet(
    exerciseId: number,
    setId: number,
    field: string,
    value: number,
  ) {
    setExercises((prevExercises) =>
      prevExercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.id !== setId) return set;
            return { ...set, [field]: value };
          }),
        };
      }),
    );
  }
  function setCompleted(exerciseId: number, setId: number) {
    const updatedExercises = exercises.map((exercise) => {
      if (exercise.id !== exerciseId) return exercise;
      return {
        ...exercise,
        sets: exercise.sets.map((set) => {
          if (set.id !== setId) return set;
          return { ...set, finished: !set.finished };
        }),
      };
    });
    setExercises(updatedExercises);
    updatedExercises.forEach((exercise) => {
      if (exercise.id !== exerciseId) return;
      const unfinishedSets = exercise.sets.some((set) => !set.finished);
      if (!unfinishedSets)
        setErrors((prevErrors) =>
          prevErrors.filter((error) => error.exercise !== exerciseId),
        );
    });
  }
  async function finishWorkout() {
    const newErrors: { exercise: number; text: string }[] = [];
    exercises.forEach((exercise) => {
      if (exercise.sets.some((set) => !set.finished)) {
        newErrors.push({
          exercise: exercise.id,
          text: "Keskeneräisiä sarjoja",
        });
      }
    });
    if (newErrors.length > 0) {
      return setErrors(newErrors);
    }
    // EI löytynyt virheitä. >> tietokantaan...
    const finishedWorkoutId = await finishWorkoutData({
      workout: {
        id: workout.id,
        exercises: exercises,
      },
    });
    // Palauttaa idn, jota muokattu tietokannassa.
    if (finishedWorkoutId === workout.id) {
      redirect("/");
    }
  }
  return (
    <div className="border border-zinc-800 w-full max-w-md rounded p-2 text-zinc-200">
      <div className="flex justify-between">
        <h1 className="text-xl text-amber-500">{workout.name}</h1>
        <div>
          <WorkoutDuration startTime={workout.startTime} />
        </div>
      </div>
      <div className=" p-2 rounded">
        {exercises.map((exercise) => (
          <div key={exercise.id}>
            <p className="text-md text-zinc-500 uppercase">
              {exercise.exercise.name}
            </p>
            {errors.map((error) => {
              if (error.exercise === exercise.id)
                return (
                  <p
                    key={String(error.exercise)}
                    className="text-amber-700 text-xs uppercase"
                  >
                    {error.text}
                  </p>
                );
            })}
            <div>
              <table className="border-separate border-spacing-y-1 w-full bg-zinc-800/20 rounded table-auto ">
                <thead>
                  <tr className="text-center">
                    <th></th>
                    <th className="text-zinc-500">#</th>
                    <th className="text-zinc-500">Toistot</th>
                    <th></th>
                    <th className="text-zinc-500">Paino (kg)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set) => (
                    <tr key={set.id} className="text-zinc-600 text-center">
                      <td
                        className={`p-2 ${set.finished && "bg-emerald-900/20 rounded-l-lg"}`}
                        onClick={() => setCompleted(exercise.id, set.id)}
                      >
                        <svg
                          className={`w-5 h-5 mx-auto text-emerald-800 hover:bg-emerald-800 rounded-full cursor-pointer ${set.finished && "bg-emerald-800"}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </td>
                      <td
                        className={`p-2 ${set.finished && "bg-emerald-900/20"}`}
                      >
                        {set.order}
                      </td>
                      <td
                        className={`p-2 ${set.finished && "bg-emerald-900/20"}`}
                      >
                        <input
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              set.id,
                              "reps",
                              Number(e.target.value),
                            )
                          }
                          className="[appearance:textfield] bg-zinc-950 text-zinc-500 p-1 text-center border border-zinc-800 rounded max-w-12 focus:outline-none focus:border-amber-600"
                          type="number"
                          name="reps"
                          placeholder={String(set.reps)}
                        />
                      </td>
                      <td className={`${set.finished && "bg-emerald-900/20"}`}>
                        x
                      </td>
                      <td
                        className={`p-2 ${set.finished && "bg-emerald-900/20"}`}
                      >
                        <input
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              set.id,
                              "weight",
                              Number(e.target.value),
                            )
                          }
                          className="[appearance:textfield] bg-zinc-950 text-zinc-500 p-1 text-center border border-zinc-800 rounded max-w-12 focus:outline-none focus:border-amber-600"
                          type="number"
                          name="weight"
                          placeholder={String(set.weight)}
                        />
                      </td>
                      <td className={`${set.finished && "bg-emerald-900/20"}`}>
                        kg
                      </td>
                      <td
                        className={`p-2 text-right  ${set.finished && "bg-emerald-900/20 rounded-r-xl"}`}
                      >
                        <button
                          type="button"
                          onClick={() => removeSet(exercise.id, set.id)}
                          className="inline-flex items-center justify-center cursor-pointer text-red-400 hover:text-red-300 transition-colors p-1 rounded"
                          title="Poista sarja"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 12h14"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => addSet(exercise.id)}
                className="mt-1.5 p-2 bg-zinc-800/40 cursor-pointer hover:bg-zinc-900 w-full rounded-full"
              >
                Lisää sarja
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => finishWorkout()}
        className="p-2 bg-emerald-800 cursor-pointer hover:bg-emerald-900 w-full rounded mt-1.5"
      >
        Lopeta treeni
      </button>
    </div>
  );
}
