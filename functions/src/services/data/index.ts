import * as admin from "firebase-admin";
import { cert, ServiceAccount } from "firebase-admin/app";
import * as firestoreAuth from "./firestore-auth.json";

const serviceAccount: ServiceAccount = firestoreAuth as ServiceAccount;

admin.initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://good-gains.firebaseio.com",
});

const db = admin.firestore();
export async function getCollection(collectionName: string) {
  try {
    const collectionSnapshot = await db.collection(collectionName).get();
    if (collectionSnapshot.empty) {
      return [];
    }
    const documents = collectionSnapshot.docs.map(doc => doc.data());
    return documents;
  } catch (error) {
    return [];
  }
}

