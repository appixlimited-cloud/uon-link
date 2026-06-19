// Streak = consecutive days (ending today or yesterday) with at least one registration.
export function computeStreak(dates: Array<string | Date>): number {
  if (!dates.length) return 0;
  const days = new Set(
    dates.map((d) => {
      const date = typeof d === "string" ? new Date(d) : d;
      return date.toISOString().slice(0, 10);
    }),
  );
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // Allow the streak to be counted from yesterday if today has no activity yet.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function streakMicrocopy(streak: number): string {
  if (streak === 0) return "Register for an event to start a streak.";
  if (streak < 7) return "Keep showing up — you're warming up.";
  if (streak < 14) return "Bronze unlocked. Keep the fire alive!";
  if (streak < 30) return "Silver vibes. You're a regular now.";
  if (streak < 60) return "Gold tier. Campus legend in the making.";
  return "Platinum. UoN Link royalty.";
}
