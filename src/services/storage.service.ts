import { Injectable } from '@nestjs/common';
import { admin } from 'src/main';
import { StorageContentType } from 'src/models/content-type.model';

@Injectable()
export class StorageService {
  async storeFile(
    file: any,
    destinationPath: string,
    options?: StorageContentType,
  ): Promise<string> {
    try {
      const bucket = admin.storage().bucket();
      const fileOptions: any = {
        metadata: {
          contentType: options || StorageContentType.SVG,
        },
      };

      await bucket.file(destinationPath).save(file, fileOptions);

      // Return the public URL of the uploaded file
      const [url] = await bucket.file(destinationPath).getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Replace with an appropriate expiration date
      });

      return url;
    } catch (error) {
      console.error('Error storing file in Firebase Storage:', error);
      throw error;
    }
  }
}
