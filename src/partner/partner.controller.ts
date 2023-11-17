import {
  Controller,
  Get,
  Post,
  Render,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { admin } from 'src/main';

@Controller('partner')
export class PartnerController {
  @Render('upload')
  @Get()
  render() {}

  @Post('')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        return res.status(400).send('No file uploaded.');
      }

      // Upload the image to Firebase Storage
      const storage = admin.storage();
      const bucket = storage.bucket();

      const imageFileName = `images/${file.originalname}`;
      const firebaseFile = bucket.file(imageFileName);

      await firebaseFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Get the public URL of the uploaded file
      const [url] = await firebaseFile.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Replace with an appropriate expiration date
      });

      // Return the public URL to the client
      return res.status(200).json({ url });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).send('Internal Server Error');
    }
  }
}
