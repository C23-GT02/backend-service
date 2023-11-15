import { Injectable, NotFoundException } from '@nestjs/common';
import { admin } from 'src/main';

@Injectable()
export class DashboardAdminService {
  async getAllDataWithinCollection(collection: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const collectionRef = admin.firestore().collection(collection);
        const snapshot = await collectionRef.get();
        const data = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }; // Include document ID in the result
        });
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getPartnerById(collection: string, documentId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const documentRef = admin
          .firestore()
          .collection(collection)
          .doc(documentId);
        const documentSnapshot = await documentRef.get();
        if (!documentSnapshot.exists) {
          reject(new NotFoundException('Document not found'));
        } else {
          resolve(documentSnapshot.data());
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
