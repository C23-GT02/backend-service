import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { LoginService } from 'src/auth/login.service';
import { RegisterService } from 'src/auth/register.service';
import { DashboardAdminService } from 'src/dashboard-admin/dashboard-admin.service';
import { firebase } from 'src/firebase.config';
import { admin, cookieOptions } from 'src/main';
import { LoginUserModel } from 'src/models/login.model';
import { RateModel } from 'src/models/rating.model';
import { RegisterModelMobile } from 'src/models/register.model';
import { editUserMobileModel } from 'src/models/user.mobile.model';
import { FirestoreService } from 'src/services/firestore.service';
import { ApiService } from './api.service';
import { HistoryRequest } from 'src/models/historyReq.model';
import { idCookie } from 'src/auth/cookies.model';
import { CookieAuthGuard } from 'src/auth.guard';

@UseGuards(CookieAuthGuard)
@Controller('api')
export class ApiController {
  constructor(
    private readonly loginService: LoginService,
    private readonly registerService: RegisterService,
    private readonly firestoreService: FirestoreService,
    private readonly dashboardAdminService: DashboardAdminService,
    private readonly apiService: ApiService,
  ) {}

  private readonly partnerCollection = 'verifiedPartner';
  private readonly productCollection = 'products';
  private readonly usersCollection = 'users';

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

  @Get('user/signout')
  async userSignout(@Req() req: Request, @Res() res: Response) {
    try {
      const { uid }: idCookie = req.signedCookies.id;

      // Revoke refresh tokens for the user
      await admin.auth().revokeRefreshTokens(uid);

      // Clear the user's session
      res.clearCookie('session');
      res.clearCookie('id');
      res.status(200).send({
        message: 'success logout',
      });
    } catch (error) {
      console.error('Error revoking refresh tokens:', error);
      throw new Error('Failed to sign out the user.');
    }
  }

  @Get('home')
  async getHomepage() {
    const product = await this.firestoreService.getAllRefWithinProducts();
    const partner = await this.dashboardAdminService.getAllDataWithinCollection(
      this.partnerCollection,
    );
    return { productCollection: product, partnerCollection: partner };
  }

  @Get('partner/:name')
  async getPartner(@Param('name') partnerName: string) {
    try {
      const partnerRef = await admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(partnerName)
        .get();

      if (partnerRef.exists) {
        return partnerRef.data();
      } else {
        throw new HttpException('Partner not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('product')
  async getAllProductPartner(@Query('partner') partnerName: string) {
    try {
      const collectionRef = admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(partnerName)
        .collection(this.productCollection);
      const snapshot = await collectionRef.get();
      const data = snapshot.docs.map((doc) => {
        const productData = { ...doc.data() };
        return { product: productData };
      });
      return { productCollection: data };
    } catch (error) {
      return error;
    }
  }

  @Post('product')
  async getProduct(@Body() body: { name: string }) {
    const { name: productName } = body; // Extract the 'name' property from the request body
    try {
      const ref = await admin
        .firestore()
        .collection(this.productCollection)
        .doc(productName)
        .get();

      if (ref.exists) {
        const data = ref.data();
        const { productRef } = data;

        if (productRef) {
          return this.firestoreService.resolveReference(productRef);
        } else {
          throw new HttpException(
            'Product reference is missing',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('qr')
  async getQRData(@Query('productRef') product: string) {
    try {
      const data = await this.firestoreService.resolveReference(product);
      return data;
    } catch (error) {
      return error;
    }
  }

  @Post('qr')
  async RateProduct(@Body() body: RateModel) {
    try {
      const result = await this.apiService.scanned(body);
      return { message: result };
    } catch (error) {
      // Handle errors and return appropriate responses
      return { message: error.message || 'Internal Server Error' };
    }
  }

  @Get('history')
  async dumpAndResolveReferences(@Body() email: HistoryRequest) {
    const collectionRef = admin
      .firestore()
      .collection(`/${this.usersCollection}/${email}/history`);

    const snapshot = await collectionRef.get();

    const references = snapshot.docs.map((doc) => {
      const documentData = doc.data();
      return documentData.transactionRef?._path?.segments.join('/');
    });

    const resolvedReferences = await Promise.all(
      references.map((reference) =>
        this.firestoreService.resolveReference(reference),
      ),
    );

    return { resolvedReferences };
  }

  @Get('verify')
  async checkCookie(@Req() req: Request) {
    try {
      const { idToken }: idCookie = req.signedCookies.id;
      console.log(req.signedCookies.id);
      const session = req.signedCookies.session;

      const [idTokenResult, sessionCookieResult] = await Promise.all([
        admin.auth().verifyIdToken(idToken),
        admin.auth().verifySessionCookie(session, true), // Set the second parameter to true if the session cookie is long-lived
      ]);

      // Do something with the verification results
      console.log(idTokenResult);
      console.log(sessionCookieResult);

      return {
        idToken: idTokenResult,
        sessionCookie: sessionCookieResult,
      };
    } catch (error) {
      // Handle errors here
      console.error('Error verifying tokens:', error);
      throw new Error('Token verification failed');
    }
  }
}
