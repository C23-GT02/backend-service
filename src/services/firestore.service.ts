import { Injectable, UseGuards } from '@nestjs/common';
import { CookieAuthGuard } from 'src/auth.guard';
import { admin } from 'src/main';


@Injectable()
export class FirestoreService {
  private readonly historyCollection: string = 'history';
  private readonly partnerCollection: string = 'verifiedPartner';
  private readonly userCollection: string = 'users';
  private readonly productsCollection = 'products';

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

  async getAllRefWithinProducts(): Promise<{ product: any }[]> {
    try {
      const querySnapshot = await admin
        .firestore()
        .collection(this.productsCollection)
        .get();

      const productsData: { product: any }[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const { productRef } = data; // Adjust field names accordingly
        const resolvedProductRef = await this.resolveReference(productRef);

        productsData.push({
          product: resolvedProductRef,
        });
      }

      return productsData;
    } catch (error) {
      throw new Error(`Failed to retrieve data: ${error.message}`);
    }
  }

  async resolveReference(reference: string): Promise<any> {
    try {
      const referenceDoc = await admin.firestore().doc(reference).get();
      if (referenceDoc.exists) {
        return referenceDoc.data();
      } else {
        throw new Error(`Referenced document not found for path: ${reference}`);
      }
    } catch (error) {
      // Handle Firestore errors or log them if needed.
      throw new Error(`Failed to resolve reference: ${error.message}`);
    }
  }
}
