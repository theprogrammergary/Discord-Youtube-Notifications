import * as admin from "firebase-admin";
import { cert, ServiceAccount } from "firebase-admin/app";
import { logger } from "firebase-functions/v2";
import * as firestoreAuth from "./firestore-auth.json";
const serviceAccount: ServiceAccount = firestoreAuth as ServiceAccount;

admin.initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://good-gains.firebaseio.com",
});

const db = admin.firestore();

export async function addDocument(collectionName: string, documentId: string, document: Record<string, any>): Promise<void> {
  try {
    const docRef = db.collection(collectionName).doc(documentId);
    await docRef.set(document);
    logger.info(`Document added with ID: ${documentId}`);
  } catch (error) {
    logger.error("Error adding document:", error);
  }
}

export async function getCollection(collectionName: string): Promise<Record<string, any>> {
  try {
    const collectionSnapshot = await db.collection(collectionName).get();
    if (collectionSnapshot.empty) {
      return {};
    }
    const documents: Record<string, any> = {};
    collectionSnapshot.docs.forEach(doc => {
      documents[doc.id] = doc.data();
    });
    return documents;
  } catch (error) {
    return {};
  }
}
