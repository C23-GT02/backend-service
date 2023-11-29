import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { admin } from 'src/main';
import { RegisterModelMobile, RegisterUserModel } from 'src/models/register.model';
import { Role } from './guard/roles.enum';

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
  async storeImage(location: string, file: Express.Multer.File | any) {
    if (!file) {
      return 'No file uploaded.';
    }

    // Upload the image to Firebase Storage
    const bucket = admin.storage().bucket();

    const imageFileName = `${location}/${file.originalname}`;
    const firebaseFile = bucket.file(imageFileName);

    // Wait for the promise to resolve before using the buffer
    const buffer = await file.buffer;

    await firebaseFile.save(buffer, {
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
        password,
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

  async registerUserMobile(data: RegisterModelMobile) {
    try {
      const { firstname, lastname, email, password } = data;

      const user = await admin.auth().createUser({
        displayName: `${firstname} ${lastname}`,
        email: email,
        password,
      });

      await admin.firestore().collection('users').doc(email).set({
        email,
        name: user.displayName,
        roles: Role.User,
        uuid: user.uid,
      });

      return {
        uuid: user.uid,
        name: user.displayName,
        email: email,
        role: Role.User,
      };
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('User already exists');
      }

      throw new BadRequestException('User registration failed', error.message);
    }
  }
}
