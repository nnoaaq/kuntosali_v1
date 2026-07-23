"use client";

import { saveWorkoutData } from "@/actions/workout";
import { useRef, useState } from "react";

export default function CreateNewWorkoutForm({
  exerciseList,
}: {
  exerciseList: { id: number; name: string; group: string }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<{ error: string; errorText: string }[]>(
    [],
  );
  const workoutNameRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchGroup, setSearchGroup] = useState("Kaikki");
  const exerciseListGroups = [
    ...new Set(exerciseList.map((exercise) => exercise.group)),
  ]; // Jokainen ryhmä omana tekstinä taulukossa
  const filteredExerciseList: { id: number; name: string; group: string }[] =
    exerciseList.filter((exercise) => {
      const searchResults = exercise.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const groupResults =
        searchGroup === "Kaikki" || exercise.group === searchGroup;
      return searchResults && groupResults;
    });
  const [exercises, setExercises] = useState<
    {
      exerciseId: number;
      sets: { id: number; order: number; reps: number; weight: number }[];
    }[]
  >([]);
  function addExercise(exerciseId: number) {
    if (exercises.some((exercise) => exercise.exerciseId === exerciseId)) {
      return setExercises((prevExercises) =>
        prevExercises.filter((exercise) => exercise.exerciseId !== exerciseId),
      );
    }
    setExercises((prevExercises) => [
      ...prevExercises,
      {
        exerciseId: exerciseId,
        sets: [{ id: Date.now(), order: 1, reps: 0, weight: 0 }],
      },
    ]);
    setErrors((prevErrors) =>
      prevErrors.filter((error) => error.error !== "workoutExercises"),
    );
  }
  function addSet(exerciseId: number) {
    setExercises((prevExercises) =>
      prevExercises.map((exercise) => {
        if (exercise.exerciseId === exerciseId) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: Date.now(),
                order: exercise.sets.length + 1,
                reps: exercise.sets[0]?.reps || 0,
                weight: exercise.sets[0]?.weight || 0,
              },
            ],
          };
        }
        return exercise;
      }),
    );
  }
  function removeSet(exerciseId: number, setId: number) {
    setExercises((prevExercises) =>
      prevExercises
        .map((exercise) => {
          if (exercise.exerciseId !== exerciseId) return exercise;
          return {
            ...exercise,
            sets: exercise.sets
              .filter((set) => set.id !== setId)
              .map((set, index) => ({
                ...set,
                order: index + 1,
              })),
          };
        })
        // Jos ei jäänyt settejä > koko liike pois.
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
        if (exercise.exerciseId !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set) => {
            if (set.id !== setId) return set;
            return {
              ...set,
              [field]: value,
            };
          }),
        };
      }),
    );
  }
  function startWorkout() {
    let errorsFound = false;
    if (!workoutNameRef.current || workoutNameRef.current.value.length === 0) {
      errorsFound = true;
      setErrors((prevErrors) => [
        ...prevErrors,
        {
          error: "workoutName",
          errorText: "Treenillä tulee olla nimi",
        },
      ]);
    }
    if (exercises.length === 0) {
      errorsFound = true;
      setErrors((prevErrors) => [
        ...prevErrors,
        {
          error: "workoutExercises",
          errorText: "Treenillä tulee vähintään yksi liike",
        },
      ]);
    }
    if (!workoutNameRef.current) return; // TSX EI VALITA NYT.
    if (!errorsFound) {
      saveWorkoutData({
        name: workoutNameRef.current.value,
        exercises: exercises,
      });
    }
  }

  return (
    <div className="max-w-md w-full">
      <button
        onClick={() => setShowForm(true)}
        hidden={showForm}
        className="p-2 w-full rounded bg-emerald-800 cursor-pointer hover:bg-emerald-900"
      >
        Aloita uusi treeni
      </button>
      <div
        hidden={!showForm}
        className="bg-zinc-900 text-zinc-100 rounded-lg p-2 flex flex-col gap-2"
      >
        <div className="flex justify-between">
          <h1 className="text-xl text-amber-500">Aloita uusi treeni</h1>
          <button className="text-zinc-500" onClick={() => setShowForm(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="pt-1.5 flex flex-col gap-2 ">
          <div>
            <p className="text-md text-zinc-500 uppercase">Treenin nimi</p>
            {errors
              .filter((error) => error.error === "workoutName")
              .map((e) => (
                <p key={e.error} className="text-amber-700 text-xs uppercase">
                  {e.errorText}
                </p>
              ))}
            <div>
              <input
                onChange={(e) => {
                  if (e.target.value.length > 0) {
                    return setErrors((prevErrors) =>
                      prevErrors.filter(
                        (error) => error.error !== "workoutName",
                      ),
                    );
                  }
                }}
                ref={workoutNameRef}
                type="text"
                className="border border-zinc-800 rounded w-full p-2 focus:outline-none hover:border-amber-500 focus:border-amber-500"
                placeholder="Rinta, jalkapäivä..."
              />
            </div>
          </div>
          <div>
            <p className="text-md text-zinc-500 uppercase">Liikkeet</p>
            {errors
              .filter((error) => error.error === "workoutExercises")
              .map((e) => (
                <p key={e.error} className="text-amber-700 text-xs uppercase">
                  {e.errorText}
                </p>
              ))}
            <div className="max-h-80 overflow-y-auto border border-zinc-800 rounded-md p-2">
              <div className="flex gap-1 overflow-x-auto pb-2">
                <div
                  onClick={() => setSearchGroup("Kaikki")}
                  className={`border border-zinc-800 p-2 rounded-lg cursor-pointer ${searchGroup === "Kaikki" && "bg-zinc-800"}`}
                >
                  <p className="text-sm">Kaikki</p>
                </div>
                {exerciseListGroups.map((exerciseGroup) => (
                  <div
                    onClick={() => setSearchGroup(exerciseGroup)}
                    key={exerciseGroup}
                    className={`border border-zinc-800 p-2 rounded-lg cursor-pointer ${searchGroup === exerciseGroup && "bg-zinc-800"}`}
                  >
                    <p className="text-sm">{exerciseGroup}</p>
                  </div>
                ))}
              </div>

              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Hae liikkeen nimellä..."
                className="border border-zinc-800 p-2 w-full text-sm italic rounded focus:outline-none focus:border-amber-500/40 mb-1"
              />
              {filteredExerciseList.length > 0 ? (
                filteredExerciseList.map((exercise) => (
                  <div
                    onClick={() => addExercise(exercise.id)}
                    key={exercise.id}
                    className="p-1 pl-2 hover:text-zinc-500 cursor-pointer flex justify-between"
                  >
                    <p>{exercise.name}</p>
                    <div
                      className={`w-4 h-4 border border-emerald-800 rounded hover:bg-emerald-900 ${exercises.some((e) => e.exerciseId === exercise.id) && "bg-emerald-800"}`}
                    ></div>
                  </div>
                ))
              ) : (
                <p className=" text-sm  p-2 text-zinc-500 uppercase">
                  Ei liikkeitä
                </p>
              )}
            </div>
          </div>
          <div
            hidden={exercises.length === 0}
            className="border border-zinc-800 rounded-lg p-2 mb-2 overflow-y-auto"
          >
            {exercises.map((exercise) => (
              <div key={exercise.exerciseId}>
                <p className="text-zinc-500 uppercase ">
                  {exerciseList.find((e) => e.id === exercise.exerciseId)?.name}
                </p>
                <div>
                  <table className=" border-spacing-y-2 w-full bg-zinc-800/20 rounded table-auto ">
                    <thead>
                      <tr className="text-center">
                        <th className="text-zinc-500">#</th>
                        <th className="text-zinc-500">Toistot</th>
                        <th></th>
                        <th className="text-zinc-500">Paino (kg)</th>
                        <th></th>
                        <th className="p-2 text-right">
                          <button
                            onClick={() => addSet(exercise.exerciseId)}
                            className="p-1 px-2 bg-emerald-800 rounded-full text-xs cursor-pointer hover:bg-emerald-900"
                          >
                            Lisää sarja
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set) => (
                        <tr key={set.id} className="text-zinc-600 text-center">
                          <td className="p-2">{set.order}</td>
                          <td className="p-2">
                            <input
                              onChange={(e) =>
                                updateSet(
                                  exercise.exerciseId,
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
                          <td>x</td>
                          <td className="p-2">
                            <input
                              onChange={(e) =>
                                updateSet(
                                  exercise.exerciseId,
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
                          <td>kg</td>
                          <td
                            onClick={() =>
                              removeSet(exercise.exerciseId, set.id)
                            }
                            className="flex justify-end p-2 text-red-400 cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 12h14"
                              />
                            </svg>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => startWorkout()}
          className="p-2  bg-emerald-800/90 cursor-pointer hover:bg-emerald-900 rounded w-full"
        >
          Aloita treeni
        </button>
      </div>
    </div>
  );
}
