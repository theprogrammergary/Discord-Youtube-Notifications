import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

export class Lock {
  private lockRef: FirebaseFirestore.DocumentReference;
  private lockId: string;

  constructor(lockName: string) {
    this.lockRef = getFirestore().collection("locks").doc(lockName);
    this.lockId = Math.random().toString(36).substring(2);
  }

  async acquire(timeout = 10000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const result = await this.lockRef.get();
      if (!result.exists || result.data()?.expiresAt < Date.now()) {
        try {
          await this.lockRef.set({
            owner: this.lockId,
            expiresAt: Date.now() + 30000
          }, { merge: true });
          return;
        } catch (error) {
          logger.error(`Error acquiring lock: ${error}`);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Failed to acquire lock");
  }

  async release(): Promise<void> {
    const result = await this.lockRef.get();
    if (result.exists && result.data()?.owner === this.lockId) {
      await this.lockRef.delete();
    }
  }
}
