import { Injectable } from '@nestjs/common';
import { RegisterUserModel } from './login.model';
import { admin } from 'src/main';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterService {
  private usersCollection: string = 'users';
  private unapprovedCollection: string = 'unverifiedPartner';

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
      } = userData;
      const encpass = await bcrypt.hash(
        password,
        parseInt(process.env.SALT) ?? 5,
      );

      const data = {
        displayName: username,
        email,
        password: encpass,
        businessName,
        nib,
        telephone,
        deskripsi,
      };

      if (bcrypt.compare(password, encpass)) {
        const user = await admin
          .firestore()
          .collection(this.unapprovedCollection)
          .doc(businessName)
          .set(data);
        return user;
      }
      return 'failed to encrypt password';
    } catch (error) {
      return error;
    }
  }

  async registerUser(userData) {
    const { email, password, displayName } = userData;

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });

      const { uid, metadata } = userRecord;
      const data = {
        uid,
        email,
        displayName,
        creationTime: metadata.creationTime,
      };

      await admin
        .firestore()
        .collection(this.usersCollection)
        .doc(uid)
        .set(data);

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
