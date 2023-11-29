import { Injectable } from '@nestjs/common';
import { admin } from 'src/main';

@Injectable()
export class FirestoreService {
  private readonly historyCollection: string = 'history';
  private readonly partnerCollection: string = 'verifiedPartner';
  private readonly userCollection: string = 'users';

  async getHistoryUser(user: string) {
    return this.getHistoryProduct(user, this.userCollection);
  }

  async getHistoryPartner(partner: string) {
    return this.getHistoryProduct(partner, this.partnerCollection);
  }

  private async getHistoryProduct(user: string, collection: string) {
    const docRef = admin
      .firestore()
      .collection(collection)
      .doc(user)
      .collection(this.historyCollection);

    try {
      const snapshot = await docRef.get();

      if (snapshot.empty) {
        return 'No documents found in the history collection for the user.';
      }

      const userHistoryData = [];

      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const historyData = doc.data();
          const productRef = historyData.product; // Assuming 'country' is the reference field

          if (productRef) {
            const productDoc = await productRef.get();

            if (productDoc.exists) {
              const countryData = productDoc.data();
              userHistoryData.push({
                documentId: doc.id,
                countryData,
              });
            }
          }
        }),
      );
      return userHistoryData;
    } catch (error) {
      return error;
    }
  }
}
