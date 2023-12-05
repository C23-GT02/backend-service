import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { admin } from 'src/main';
import { ApproverDTO } from '../models/access.model';

@Injectable()
export class AdminAccessService {
  private usersCollection: string = 'users';

  // add roles to existing users
  async createUserRole(data: ApproverDTO) {
    const { username, email, role } = data;
    const userData = await admin.auth().getUserByEmail(email);

    const payload = {
      email: email,
      name: username,
      roles: role,
      uuid: userData.uid,
    };

    try {
      await admin
        .firestore()
        .collection(this.usersCollection)
        .doc(email)
        .set(payload)
        .then(() => {
          return true;
        })
        .catch((error) => {
          return new HttpException(
            'failed create a user role',
            HttpStatus.BAD_REQUEST,
            {
              cause: error,
            },
          );
        });
    } catch (error) {
      return new HttpException(
        'failed create a user role',
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  async deleteUserRole(email: string) {
    try {
      await admin
        .firestore()
        .collection(this.usersCollection)
        .doc(email)
        .delete();
      return true;
    } catch (error) {
      throw new HttpException(
        'Failed to delete user role',
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }
}
