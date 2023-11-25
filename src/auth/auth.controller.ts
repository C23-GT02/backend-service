// Import necessary modules and dependencies
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  Render,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { LoginUserModel, RegisterUserModel } from '../models/login.model';
import { admin } from 'src/main';
import { RegisterService } from './register.service';
import { LoginService } from './login.service';
import { FileInterceptor } from '@nestjs/platform-express';

// Define a controller for the '/register' route
@Controller('register')
export class RegisterController {
  constructor(private registerService: RegisterService) {}
  @Render('register')
  @Get()
  async registerUserPage() {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async registerUser(
    @Body() body: RegisterUserModel,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    logo: Express.Multer.File,
    @Res() res: Response,
  ) {
    const { email, businessName } = body;

    console.log(body);

    if (!this.registerService.checkExistingUser(email)) {
      res.send('user already exist').status(401);
    }

    try {
      logo.originalname = 'logo.png';
      // check if user already partner/admin/approval
      const image = await this.registerService.storeImage(
        `${businessName}/logo`,
        logo,
      );
      body.logo = image;
      // Store the user data (including the logo) in the database
      console.log(body);
      await this.registerService.storeUnapprovedUser(body);
      // Redirect to the login page
      res.redirect('/login');
    } catch (error) {
      return error;
    }
  }
}

// Define a controller for the '/login' route
@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}
  // cookie expiration in day
  private duration = 1000 * 3600 * 24 * parseInt(process.env.COOKIES_EXP);
  private cookieOptions: CookieOptions = {
    maxAge: this.duration,
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + this.duration),
    secure: process.env.ENV_TYPE === 'PROD',
  };

  // Handle POST requests to set cookies and redirect to '/dashboard'
  @Post()
  async setCookie(
    @Body() body: LoginUserModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Authenticate the user and obtain the necessary data
      const data = await this.loginService.loginUser(body);
      // Create a session cookie using Firebase Admin SDK
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(data.idToken, { expiresIn: this.duration }); // counted in milliseconds

      // Set 'id' cookie with a simple value
      res.cookie('id', data, this.cookieOptions);

      // Set 'session' cookie with the session cookie value
      res.cookie('session', sessionCookie, this.cookieOptions);

      // Redirect to the appropriate page and return to avoid further execution
      if (data.role === 'admin' || data.role === 'approver') {
        return res.redirect('/admin');
      } else if (data.role === 'partner') {
        return res.redirect('/partner');
      } else {
        return res.redirect('/register');
      }
    } catch (error) {
      // Handle authentication errors
      console.error(error);
      return res.status(401).send('Authentication failed');
    }
  }

  // Handle GET requests to check for existing cookies
  @Render('login')
  @Get()
  async getCookie() {}
}
