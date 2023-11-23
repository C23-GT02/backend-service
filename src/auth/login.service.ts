import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserModel } from './login.model';
import { firebase } from 'src/firebase.config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { admin } from 'src/main';

@Injectable()
export class LoginService {
  private userCollection: string = 'users';

  // get UserRole From Documents
  private async checkRole(email: string) {
    try {
      const docRef = admin
        .firestore()
        .collection(this.userCollection)
        .doc(email);
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        if (data && 'roles' in data) {
          return data.roles;
        } else {
          console.error('Document does not have a "role" field.');
          return null;
        }
      } else {
        console.error('Document with UUID not found.');
        return null;
      }
    } catch (error) {
      console.error('Error checking role:', error);
      throw new UnauthorizedException('Unauthorized Approver Account');
    }
  }

  async loginUser(user: LoginUserModel) {
    const auth = getAuth(firebase);
    try {
      const { email, password } = user;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await userCredential.user.getIdToken(true);
      const { uid } = userCredential.user;
      const role = await this.checkRole(email);

      if (role === null) {
        throw new UnauthorizedException(
          'Unauthorized Account for Amati Dashboard',
        );
      }

      const documentSnapshot = await admin
        .firestore()
        .collection(this.userCollection)
        .doc(email)
        .get();

      // Initialize businessName outside the if-else block
      let businessName = null;

      // Check if the document exists
      if (documentSnapshot.exists) {
        // Now, businessName will either be the value from the document or null if it doesn't exist
        businessName = documentSnapshot.data()?.businessName;
      }

      console.log(businessName);

      const payload = {
        idToken,
        uid,
        businessName,
        email,
        role,
      };

      return payload;
    } catch (error) {
      // You might want to log the error or handle it differently
      console.error('Login error:', error);
      throw new UnauthorizedException('Login failed'); // Or return a more specific error message
    }
  }
}
