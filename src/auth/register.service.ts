import { Injectable } from '@nestjs/common';
import { RegisterUserModel } from './login.model';
import { admin } from 'src/main';

@Injectable()
export class RegisterService {
  private usersCollection: string = 'users';
  private unapprovedCollection: string = 'unverifiedPartner';

  async checkExistingUser(user: string): Promise<boolean> {
    const userRef = await admin
      .firestore()
      .collection(this.usersCollection)
      .doc(user)
      .get();

    if (userRef.exists) {
      return true;
    }
  }

  // handle user register user to make disabled account, and create ticket to be partner
  async storeImage(location: string, file: Express.Multer.File) {
    if (!file) {
      return 'No file uploaded.';
    }

    // Upload the image to Firebase Storage
    const bucket = admin.storage().bucket();

    const imageFileName = `${location}/${file.originalname}`;
    const firebaseFile = bucket.file(imageFileName);

    await firebaseFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Get the public URL of the uploaded file
    const [url] = await firebaseFile.getSignedUrl({
      action: 'read',
      expires: '03-09-2999', // Replace with an appropriate expiration date
    });

    // Return the public URL to the client
    return url;
  }

  async storeUnapprovedUser(userData: RegisterUserModel) {
    try {
      const {
        username,
        email,
        password,
        businessName,
        nib,
        telephone,
        deskripsi,
        logo,
      } = userData;

      const user = await admin.auth().createUser({
        displayName: username,
        email,
        password: password,
        disabled: true,
      });

      const data = {
        uuid: user.uid,
        displayName: username,
        email,
        businessName,
        nib,
        telephone,
        deskripsi,
        logo,
      };

      await admin
        .firestore()
        .collection(this.unapprovedCollection)
        .doc(businessName)
        .set(data);
      return data;
    } catch (error) {
      return error;
    }
  }
}
