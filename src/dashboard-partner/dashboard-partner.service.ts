import { Injectable } from '@nestjs/common';
import { admin } from 'src/main';
import { createProductModel } from '../models/product.model';
import { MemberModel } from 'src/models/founder.model';

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
        await admin
          .firestore()
          .collection(this.partnerCollection)
          .doc(partner)
          .collection(this.productCollection)
          .doc(product.name)
          .set(product);

        resolve('product berhasil dibuat');
      } catch (error) {
        reject(error);
      }
    });
  }

  async setOrUpdateDocument(ref: string, body: MemberModel) {
    try {
      const { name, role, bio, link } = body;
      const dataref = admin.firestore().doc(ref);
      const getData = await dataref.get();
      if (getData.exists) {
        return dataref.update({
          name,
          role,
          bio,
          link,
        });
      }
      return dataref.set(body);
    } catch (error) {
      return error;
    }
  }
}
