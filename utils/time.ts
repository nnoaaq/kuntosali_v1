export function formatTime(startTime: string) {
  const formattedTime = Intl.DateTimeFormat("fi-FI", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${startTime}Z`));
  return formattedTime;
}
