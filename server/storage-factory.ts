import { IStorage } from "./storage";
import { MemStorage } from "./storage";
import { PostgresStorage } from "./storage-pg";
import { log } from "./vite";

// Class to manage storage implementation selection
export class StorageFactory {
  private static instance: IStorage;
  private static dbConnected: boolean = false;

  static setDatabaseConnected(connected: boolean): void {
    this.dbConnected = connected;
    log(`Database connection status: ${connected ? 'Connected' : 'Disconnected'}`, 'database');
  }

  static getStorage(): IStorage {
    if (!this.instance) {
      if (this.dbConnected) {
        log("Using PostgreSQL storage implementation", 'database');
        this.instance = new PostgresStorage();
      } else {
        log("Using in-memory storage implementation", 'database');
        this.instance = new MemStorage();
      }
    }
    return this.instance;
  }
}