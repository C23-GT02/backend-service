import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserModel } from './login.model';
import { firebase } from 'src/firebase.config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { admin } from 'src/main';
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
      const payload: idCookie = {
        idToken,
        uid,
        email,
        role,
      };
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
