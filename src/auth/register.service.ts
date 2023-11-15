import { Injectable } from '@nestjs/common';
import { RegisterUserModel } from './login.model';
import { admin } from 'src/main';

@Injectable()
export class RegisterService {
  private usersCollection: string = 'users';
  private unapprovedCollection: string = 'unverifiedPartner';

  // handle user register user to make disabled account, and create ticket to be partner
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

      const data = {
        displayName: username,
        email,
        businessName,
        nib,
        telephone,
        deskripsi,
      };

      const user = await admin.auth().createUser({
        displayName: username,
        email,
        password: password,
        disabled: true,
      });

      await admin
        .firestore()
        .collection(this.unapprovedCollection)
        .doc(businessName)
        .set(data);
      return user.uid;
    } catch (error) {
      return error;
    }
  }
}
