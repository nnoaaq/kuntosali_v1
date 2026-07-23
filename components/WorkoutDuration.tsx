"use client";
import { useEffect, useState } from "react";

export function WorkoutDuration({ startTime }: { startTime: string }) {
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {
    function calculateDuration() {
      const startTimeUTC = new Date(`${startTime}Z`).getTime(); // aloitusaika utc vyöhykkeellä millisekunteina
      const timeNow = new Date().getTime(); // nykyinen aika utc vyöhykkeellä millisekunteina
      const timeDifferenceInMs = timeNow - startTimeUTC; // ero millisekunteina nykyhetken ja lopetuksen välillä
      const hours = Math.floor(timeDifferenceInMs / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeDifferenceInMs % (1000 * 60 * 60)) / (1000 * 60),
      );
      const seconds = Math.floor((timeDifferenceInMs / 1000) % 60);
      setDuration(
        `${hours > 0 ? hours + ":" : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }
    calculateDuration(); // Komponentin "laskeutuessa" ensimmäinen tieto heti näkyviin
    const interval = setInterval(calculateDuration, 1000); //1000ms = 1 sek
    return () => clearInterval(interval);
  }, [startTime]);
  return <div className="p-1 bg-emerald-900 rounded-full px-2">{duration}</div>;
}
