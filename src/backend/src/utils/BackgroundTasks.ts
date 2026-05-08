import { RentalDB } from '../database/RentalDB';

export class BackgroundTasks {
  private static cleanupInterval: NodeJS.Timeout | null = null;

  static start() {
    if (this.cleanupInterval) return;

    console.log('Background tasks started (interval: 1 minute)');
    
    // Run cleanup every minute
    this.cleanupInterval = setInterval(async () => {
      try {
        const count = await RentalDB.cleanupExpiredRentals();
        if (count > 0) {
          console.log(`[BackgroundTasks] Cleaned up ${count} expired rentals.`);
        }
      } catch (err) {
        console.error('[BackgroundTasks] Error during cleanup task:', err);
      }
    }, 60 * 1000);

    // Run once immediately on start
    this.runImmediateCleanup();
  }

  static stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private static async runImmediateCleanup() {
    try {
      await RentalDB.cleanupExpiredRentals();
    } catch (err) {
      console.error('[BackgroundTasks] Error during immediate cleanup:', err);
    }
  }
}
