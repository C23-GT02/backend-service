import { Injectable } from '@nestjs/common';
import { admin } from 'src/main';
import { createProductModel } from '../models/product.model';
import { DashboardAdminService } from 'src/dashboard-admin/dashboard-admin.service';

@Injectable()
export class DashboardPartnerService {
  constructor(private adminService: DashboardAdminService) {}
  private partnerCollection: string = 'verifiedPartner';
  private productCollection: string = 'products';
  private employeeCollection: string = 'employee';
  private historyCollection: string = 'history';

  async getAllPartnerProducts(document: string) {
    try {
      const collectionRef = admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(document)
        .collection(this.productCollection);

      const snapshot = await collectionRef.get();
      const products = snapshot.docs.map((doc) => {
        const productData = { id: doc.id, ...doc.data() };
        return productData;
      });

      const productsWithData = await Promise.all(
        products.map(async (product) => {
          if (Array.isArray(product.images)) {
            product.images = await Promise.all(
              product.images.map(async (imageURL) => {
                return await this.adminService.loadImage(imageURL);
              }),
            );
          }
          return product;
        }),
      );

      return productsWithData;
    } catch (error) {
      throw error;
    }
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

        resolve('Product berhasil ditambahkan');
      } catch (error) {
        reject(error);
      }
    });
  }

  async setOrUpdateDocument(ref: string, data) {
    try {
      const dataref = admin.firestore().doc(ref);
      const getData = await dataref.get();
      if (getData.exists) {
        await dataref.update(data);
        return 'success update data';
      }
      await dataref.set(data, { merge: true });
      return 'success create data';
    } catch (error) {
      return error;
    }
  }

  async getDocumentFromRef(path: string) {
    try {
      const dataRef = await admin.firestore().doc(path).get();

      if (dataRef.exists) {
        return dataRef.data();
      } else {
        throw new Error(`Document at path '${path}' does not exist.`);
      }
    } catch (error) {
      console.error('Error getting document from Firebase:', error.message);
      return error;
    }
  }

  async getCollectionDataFromRef(path) {
    try {
      const snapshot = await admin.firestore().collection(path).get();

      const data = [];

      for (const doc of snapshot.docs) {
        const docData = doc.data();
        // Check if the document has a 'photo' field
        if (docData && docData.image) {
          // Fetch base64 representation of the photo
          docData.image = await this.adminService.loadImage(docData.image);
        }
        // Add the modified document data to the array
        data.push(docData);
      }
      return data;
    } catch (error) {
      console.error(
        'Error getting collection data from Firebase:',
        error.message,
      );
      throw error;
    }
  }

  async countDocumentWithinCollection(collectionRef: string) {
    try {
      const querySnapshot = await admin
        .firestore()
        .collection(collectionRef)
        .get();
      return querySnapshot.size;
    } catch (error) {
      return error;
    }
  }

  async countData(businessName: string) {
    const partnerRef = `${this.partnerCollection}/${businessName}`;
    const productRef = `${partnerRef}/${this.productCollection}`;
    const employeeRef = `${partnerRef}/${this.employeeCollection}`;
    const historyRef = `${partnerRef}/${this.historyCollection}`;

    try {
      const [product, employee, customer] = await Promise.all([
        this.countDocumentWithinCollection(productRef),
        this.countDocumentWithinCollection(employeeRef),
        this.countDocumentWithinCollection(historyRef),
      ]);
      return { product, employee, customer };
    } catch (error) {
      return error;
    }
  }
}
