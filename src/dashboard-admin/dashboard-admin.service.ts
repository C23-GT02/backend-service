import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from 'src/auth/guard/roles.enum';
import { admin } from 'src/main';
import { ApproverDTO } from './access.model';

@Injectable()
export class DashboardAdminService {
  private usersCollection: string = 'users';

  async getAllDataWithinCollection(collection: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const collectionRef = admin.firestore().collection(collection);
        const snapshot = await collectionRef.get();
        const data = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }; // Include document ID in the result
        });
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getPartnerById(collection: string, documentId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const documentRef = admin
          .firestore()
          .collection(collection)
          .doc(documentId);
        const documentSnapshot = await documentRef.get();
        if (!documentSnapshot.exists) {
          reject(new NotFoundException('Document not found'));
        } else {
          resolve(documentSnapshot.data());
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async approved(
    sourceCollection: string,
    targetCollection: string,
    documentId: string,
  ): Promise<void> {
    try {
      const sourceDocumentRef = admin
        .firestore()
        .collection(sourceCollection)
        .doc(documentId);
      const sourceDocumentSnapshot = await sourceDocumentRef.get();

      if (!sourceDocumentSnapshot.exists) {
        throw new NotFoundException('Document not found');
      }

      const data = sourceDocumentSnapshot.data();
      data.timestamp = new Date().toISOString();

      // Create a new document in the target collection
      const targetDocumentRef = admin
        .firestore()
        .collection(targetCollection)
        .doc(documentId);
      await targetDocumentRef.set(data);

      await admin.auth().updateUser(data.uuid, {
        disabled: false,
      });
      await admin
        .firestore()
        .collection(this.usersCollection)
        .doc(data.email)
        .set({
          email: data.email,
          name: data.displayName,
          roles: Role.Partner,
          uuid: data.uuid,
        });

      // Delete the original document in the source collection
      await sourceDocumentRef.delete();
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers() {
    const userList = await admin.auth().listUsers();
    const users = userList.users.map((userRecord) => ({
      email: userRecord.email,
    }));

    return users;
  }

  async createApproverUser(data: ApproverDTO) {
    const { username, email, role } = data;
    console.log(data);
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
          return new HttpException('custom message', HttpStatus.BAD_REQUEST, {
            cause: error,
          });
        });
    } catch (error) {
      return new HttpException('custom message', HttpStatus.BAD_REQUEST, {
        cause: error,
      });
    }
  }

  // async loadImage() {
  //   admin.storage().bucket().
  // }
}
