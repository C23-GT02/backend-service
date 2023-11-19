// Import necessary modules and dependencies
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Render,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { LoginUserModel, RegisterUserModel } from './login.model';
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
    const { businessName } = body;

    try {
      logo.originalname = 'logo.png';

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
    // Authenticate the user and obtain the necessary data
    const data = await this.loginService.loginUser(body);
    // Create a session cookie using Firebase Admin SDK
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(data.idToken, { expiresIn: this.duration }); // counted in miliseconds
    // Set 'id' and 'session' cookies with the obtained data
    res.cookie('id', data, this.cookieOptions);
    res.cookie('session', sessionCookie, this.cookieOptions);
    // Redirect to the '/dashboard' page
    if (data.role == 'admin' || data.role == 'approver') {
      res.redirect('/admin');
    } else if (data.role == 'partner') {
      res.redirect('/partner');
      // res.redirect('partner');
    }
    res.redirect('/register');
  }

  // Handle GET requests to check for existing cookies
  @Render('login')
  @Get()
  async getCookie() {}
}
