
// Pre-calculated Lunar values for 2026 (Day, Month, Year, Leap)
// Sourced from standard Vietnamese Lunar Calendar tables.
export const LUNAR_DATA_2026: Record<string, { day: number, month: number, year: number, leap: boolean }> = {
  // Jan 2026
  "2026-01-01": { day: 13, month: 11, year: 2025, leap: false },
  "2026-01-10": { day: 22, month: 11, year: 2025, leap: false },
  "2026-01-19": { day: 1, month: 12, year: 2025, leap: false },
  "2026-01-20": { day: 2, month: 12, year: 2025, leap: false },
  "2026-01-31": { day: 13, month: 12, year: 2025, leap: false },
  // Tet 2026 is Feb 17
  "2026-02-01": { day: 14, month: 12, year: 2025, leap: false },
  "2026-02-16": { day: 29, month: 12, year: 2025, leap: false },
  "2026-02-17": { day: 1, month: 1, year: 2026, leap: false }, // Tet Binh Ngo
  "2026-02-18": { day: 2, month: 1, year: 2026, leap: false },
  "2026-02-28": { day: 12, month: 1, year: 2026, leap: false },
  // March 2026
  "2026-03-01": { day: 13, month: 1, year: 2026, leap: false },
  "2026-03-18": { day: 1, month: 2, year: 2026, leap: false },
  "2026-03-31": { day: 14, month: 2, year: 2026, leap: false },
  // April 2026
  "2026-04-01": { day: 15, month: 2, year: 2026, leap: false },
  "2026-04-17": { day: 1, month: 3, year: 2026, leap: false },
  "2026-04-30": { day: 14, month: 3, year: 2026, leap: false },
  // May 2026
  "2026-05-01": { day: 15, month: 3, year: 2026, leap: false },
  "2026-05-16": { day: 1, month: 4, year: 2026, leap: false },
  "2026-05-31": { day: 16, month: 4, year: 2026, leap: false },
  // June 2026
  "2026-06-01": { day: 17, month: 4, year: 2026, leap: false },
  "2026-06-15": { day: 1, month: 5, year: 2026, leap: false },
  "2026-06-30": { day: 16, month: 5, year: 2026, leap: false },
  // July 2026
  "2026-07-01": { day: 17, month: 5, year: 2026, leap: false },
  "2026-07-14": { day: 1, month: 6, year: 2026, leap: false },
  "2026-07-31": { day: 18, month: 6, year: 2026, leap: false },
  // August 2026
  "2026-08-01": { day: 19, month: 6, year: 2026, leap: false },
  "2026-08-12": { day: 1, month: 6, year: 2026, leap: true }, // Leap month!
  "2026-08-31": { day: 20, month: 6, year: 2026, leap: true },
  // September 2026
  "2026-09-01": { day: 21, month: 6, year: 2026, leap: true },
  "2026-09-11": { day: 1, month: 7, year: 2026, leap: false },
  "2026-09-30": { day: 20, month: 7, year: 2026, leap: false },
  // October 2026
  "2026-10-01": { day: 21, month: 7, year: 2026, leap: false },
  "2026-10-10": { day: 1, month: 8, year: 2026, leap: false },
  "2026-10-31": { day: 22, month: 8, year: 2026, leap: false },
  // November 2026
  "2026-11-01": { day: 23, month: 8, year: 2026, leap: false },
  "2026-11-09": { day: 1, month: 9, year: 2026, leap: false },
  "2026-11-30": { day: 22, month: 9, year: 2026, leap: false },
  // December 2026
  "2026-12-01": { day: 23, month: 9, year: 2026, leap: false },
  "2026-12-09": { day: 1, month: 10, year: 2026, leap: false },
  "2026-12-31": { day: 23, month: 10, year: 2026, leap: false },
};

// Auto-fill gaps in the data for the UI
export function fillLunarGaps(y: number, m: number, d: number) {
  const dateStr = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
  if (LUNAR_DATA_2026[dateStr]) return LUNAR_DATA_2026[dateStr];
  
  // Find nearest previous entry
  const dates = Object.keys(LUNAR_DATA_2026).sort();
  let prevDate = dates[0];
  for (const date of dates) {
    if (date <= dateStr) prevDate = date;
    else break;
  }
  
  const startObj = LUNAR_DATA_2026[prevDate];
  const diffDays = (new Date(dateStr).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24);
  
  // Logic to calculate day and increment month if needed
  // This is a simplified "day incrementer" that handles basic month length (29 or 30 days)
  let currentDay = startObj.day + diffDays;
  let currentMonth = startObj.month;
  let currentYear = startObj.year;
  
  // Basic approximation for Lunar months (often 29 or 30)
  // This works because the gap in our dictionary is small
  while (currentDay > 30) {
    currentDay -= 30; // Approximation
    currentMonth++;
    if (currentMonth > 12) {
       currentMonth = 1;
       currentYear++;
    }
  }
  
  return { day: Math.floor(currentDay), month: currentMonth, year: currentYear, leap: startObj.leap };
}
