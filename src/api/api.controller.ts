import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { LoginService } from 'src/auth/login.service';
import { RegisterService } from 'src/auth/register.service';
import { firebase } from 'src/firebase.config';
import { admin, cookieOptions } from 'src/main';
import { LoginUserModel } from 'src/models/login.model';
import { RegisterModelMobile } from 'src/models/register.model';
import { editUserMobileModel } from 'src/models/user.mobile.model';
import { FirestoreService } from 'src/services/firestore.service';

@Controller('api')
export class ApiController {
  constructor(
    private readonly loginService: LoginService,
    private readonly registerService: RegisterService,
    private readonly firestoreService: FirestoreService,
  ) {}
  // Begin Auth Controller Route
  @Post('auth/login')
  async LoginUser(
    @Body() body: LoginUserModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Authenticate the user and obtain the necessary data
      const { data, sessionCookie } =
        await this.loginService.handleAuthentication(body);

      // Set 'id' cookie with a simple value
      res.cookie('id', data, cookieOptions);
      // Set 'session' cookie with the session cookie value
      res.cookie('session', sessionCookie, cookieOptions);

      // Redirect to the appropriate page and return to avoid further execution
      res.status(HttpStatus.OK).send({ data, sessionCookie });
    } catch (error) {
      // Handle authentication errors
      console.error(error);
      return res.status(HttpStatus.UNAUTHORIZED).send('Authentication failed');
    }
  }

  @Post('auth/register')
  async registerUserMobile(
    @Body() data: RegisterModelMobile,
    @Res() res: Response,
  ) {
    try {
      console.log(data);
      const userData = await this.registerService.registerUserMobile(data);
      res.status(HttpStatus.CREATED).send({
        message: 'User created successfully',
        data: userData,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Handle other exceptions or unexpected errors
      console.error('Unexpected error during user registration:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Unexpected error during user registration',
      });
    }
  }

  // Begin User Controller Route

  @Get('user')
  async getUserData(@Query('email') email: string, @Res() res: Response) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      const { uid, displayName, phoneNumber, photoURL } = user;
      const data = {
        uid,
        email,
        displayName,
        photoURL,
        phoneNumber,
      };
      return res.status(200).json(data);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found');
      }
      throw error; // Re-throw other errors
    }
  }

  @Post('user/edit')
  @UseInterceptors(FileInterceptor('image'))
  async editUserAuth(
    @Body() data: editUserMobileModel,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    image: Express.Multer.File = null,
    @Res() res?: Response,
  ) {
    const { uid, email, displayName, phoneNumber } = data;
    const location = `user/${email}`;
    const payload: any = {};

    try {
      if (displayName !== null && displayName !== undefined) {
        payload.displayName = displayName;
      }

      if (image !== null && image !== undefined) {
        data.photoURL = await this.registerService.storeImage(location, image);
        payload.photoURL = data.photoURL;
      }

      if (phoneNumber !== null && phoneNumber !== undefined) {
        payload.phoneNumber = phoneNumber;
      }

      await admin.firestore().collection('users').doc(email).update(payload);
      await admin.auth().updateUser(uid, payload);

      if (res) {
        res
          .status(HttpStatus.CREATED)
          .send({ message: 'User successfully edited' });
      }
    } catch (error) {
      if (res) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'Failed to edit user', error });
      } else {
        throw error;
      }
    }
  }

  @Post('user/reset')
  async resetPassword(@Body('email') email: string) {
    try {
      console.log(email);
      const auth = await getAuth(firebase);
      await sendPasswordResetEmail(auth, email).then(() => {
        return 'reset password links sucessfully sent';
      });
    } catch (error) {
      return error;
    }
  }

  @Get('home')
  async getHomepage() {
    return this.firestoreService.getAllRefWithinProducts();
  }
}
