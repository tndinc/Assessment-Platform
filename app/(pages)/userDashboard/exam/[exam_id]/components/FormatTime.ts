export function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60); // Get the hours
    const remainingMinutes = minutes % 60; // Get the remaining minutes
    const seconds = 0; // Assuming we start with 0 seconds
  
    // Return the formatted time in HH:MM:SS format
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  