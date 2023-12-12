import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserModel } from '../models/login.model';
import { firebase } from 'src/firebase.config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { admin, duration } from 'src/main';
import { idCookie } from './cookies.model';

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

      let businessName = null;

      if (documentSnapshot.exists) {
        businessName = documentSnapshot.data()?.businessName;
      }

      console.log('Business Name:', businessName);

      const payload = {
        idToken,
        uid,
        businessName,
        email,
        role,
      };

      return payload;
    } catch (error) {
      console.error('Login error:', error);
      // Provide more specific error messages based on error codes or types
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async handleAuthentication(body: LoginUserModel) {
    try {
      const data: idCookie = await this.loginUser(body);
      const sessionCookie: string = await admin
        .auth()
        .createSessionCookie(data.idToken, { expiresIn: duration });
      // Customize the response based on the controller
      return { data, sessionCookie };
    } catch (error) {
      console.error('Authentication error:', error);
      return error;
    }
  }
}
