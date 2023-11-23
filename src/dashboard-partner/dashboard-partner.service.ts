import { Injectable } from '@nestjs/common';
import { admin } from 'src/main';
import { createProductModel } from './product.model';

@Injectable()
export class DashboardPartnerService {
  private partnerCollection: string = 'verifiedPartner';
  private productCollection: string = 'products';

  async getAllPartnerProducts(document: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const collectionRef = admin
          .firestore()
          .collection(this.partnerCollection)
          .doc(document)
          .collection(this.productCollection);
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

  async createProduct(partner: string, product: createProductModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const collectionRef = admin
          .firestore()
          .collection(this.partnerCollection)
          .doc(partner)
          .collection(this.productCollection)
          .doc(product.name);
        const data = await collectionRef.set(product);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
}
