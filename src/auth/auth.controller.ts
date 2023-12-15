// Import necessary modules and dependencies
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  ParseFilePipe,
  Post,
  Render,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginUserModel } from '../models/login.model';
import { cookieOptions } from 'src/main';
import { RegisterService } from './register.service';
import { LoginService } from './login.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterUserModel } from 'src/models/register.model';

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

    if (!this.registerService.checkExistingUser(email)) {
      return res.status(HttpStatus.CONFLICT).send('User already exists');
    }

    try {
      // check if user already partner/admin/approval
      const image = await this.registerService.storeImage(
        `${businessName}/logo`,
        logo,
      );
      body.logo = image;
      // Store the user data (including the logo) in the database
      await this.registerService.storeUnapprovedUser(body);
      // Redirect to the login page
      res.status(HttpStatus.OK).redirect('/login');
    } catch (error) {
      console.error(error); // Log the detailed error for debugging
      return res.status(500).send('Internal Server Error');
    }
  }
}

// Define a controller for the '/login' route
@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  private readonly roleRedirects = {
    admin: '/admin',
    approver: '/admin', // Redirecting approvers to the same URL as admins
    partner: '/partner/profile',
    default: '/register', // Default redirect for other roles
  };

  // Handle GET requests to check for existing cookies
  @Render('login')
  @Get()
  async renderLogin() {}

  // Handle POST requests to set cookies and redirect to '/dashboard'
  @Post()
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
      const redirectUrl =
        this.roleRedirects[data.role] || this.roleRedirects.default;
      res.redirect(redirectUrl);
    } catch (error) {
      // Handle authentication errors
      console.error(error);
      return res.status(HttpStatus.UNAUTHORIZED).send('Authentication failed');
    }
  }
}
