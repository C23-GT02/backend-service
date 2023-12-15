import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { admin } from 'src/main';
import { RateFinal, RateModel } from 'src/models/rating.model';

@Injectable()
export class ApiService {
  private readonly historyCollection = 'history';
  private readonly usersCollection = 'users';

  async scanned(body: RateModel): Promise<string> {
    const {
      uid,
      productRef,
      partnerRef,
      timestamp,
      name,
      rating,
      review,
      email,
    } = body;

    // Check if productRef is empty, null, undefined, or does not exist
    if (!productRef) {
      throw new BadRequestException('Invalid product reference');
    }

    // Check if uid is valid by checking the existence of a document in the products collection
    const productDocRef = admin
      .firestore()
      .doc(`${productRef}/product-id/${uid}`);
    const productDoc = await productDocRef.get();

    if (!productDoc.exists) {
      throw new BadRequestException('Invalid UID for the specified product');
    }

    const productHistory: RateFinal = {
      uid,
      productRef,
      name,
      timestamp,
      rating,
      review,
    };

    try {
      const ref = await admin
        .firestore()
        .doc(partnerRef)
        .collection(this.historyCollection)
        .doc(uid);

      await ref.set(productHistory);

      const uref = await admin
        .firestore()
        .collection(this.usersCollection)
        .doc(email)
        .collection(this.historyCollection)
        .doc(uid);

      // Set uref with a reference to the productHistory document
      await uref.set({ transactionRef: ref });

      // Delete the entire product document
      await productDocRef.delete();

      return 'Success reviewing products';
    } catch (error) {
      // Handle other errors here
      console.error(error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
