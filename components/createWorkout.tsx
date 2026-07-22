"use client";

import { useState } from "react";

export default function CreateNewWorkoutForm({
  exerciseList,
}: {
  exerciseList: { id: number; name: string; group: string }[];
}) {
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
  return (
    <div className="max-w-md w-full">
      <div className="bg-zinc-900 text-zinc-100 rounded-lg p-2">
        <h1 className="text-xl text-amber-500">Aloita uusi treeni</h1>
        <div className="pt-1.5 flex flex-col gap-2">
          <div>
            <p className="text-md text-zinc-500 uppercase">Liikkeet</p>
            <div className="max-h-80 overflow-y-auto border border-zinc-800 rounded-md p-2">
              <p className="text-zinc-500 text-xs uppercase tracking-wider">
                Lihasryhmä
              </p>
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
                    key={exercise.id}
                    className="p-1 pl-2 border-b border-zinc-800 hover:text-zinc-500 cursor-pointer"
                  >
                    {exercise.name}
                  </div>
                ))
              ) : (
                <p className=" text-sm  p-2 text-zinc-500 uppercase">
                  Ei liikkeitä
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
