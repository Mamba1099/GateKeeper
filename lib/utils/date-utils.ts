/**
 * Get all weekdays (Monday-Friday) in a given month
 */
export function getWeekdaysInMonth(month: number, year: number): Date[] {
  const weekdays: Date[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Monday = 1, Tuesday = 2, ..., Friday = 5
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekdays.push(date);
    }
  }

  return weekdays;
}

/**
 * Format date for comparison
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString("default", {
    month: "long",
  });
}
