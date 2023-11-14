// Import necessary modules and dependencies
import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { LoginUserModel, RegisterUserModel } from './login.model';
import { admin } from 'src/main';
import { RegisterService } from './register.service';
import { LoginService } from './login.service';
import { RolesGuard } from './guard/roles.guard';
import { CookieAuthGuard } from 'src/auth.guard';
import { Roles } from './guard/roles.decorator';
import { Role } from './guard/roles.enum';

@UseGuards(CookieAuthGuard)
@UseGuards(RolesGuard)
@Roles(Role.Admin, Role.Approver)
@Controller('register')
export class RegisterController {
  constructor(private registerService: RegisterService) {}
  @Render('register')
  @Get()
  async registerUserPage() {}

  @Post()
  async registerUser(@Body() body: RegisterUserModel) {
    const user = await this.registerService.storeUnapprovedUser(body);
    console.log(user);
    return user;
  }
}

// Define a controller for the '/login' route

@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}
  // cookie expiration in day
  private duration = 1000 * 3600 * 24 * parseInt(process.env.COOKIES_EXP);
  // Configure options for cookies
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
      res.redirect('partner');
    }
    res.redirect('/register');
  }

  // Handle GET requests to check for existing cookies
  @Render('login')
  @Get()
  async getCookie(@Req() req: Request, @Res() res: Response) {
    // Check if 'signedCookies' is defined and if 'id' is present
    // if (req.signedCookies && req.signedCookies.id) {
    //   // Destructure properties if the 'id' cookie exists
    //   const { idToken, role } = req.signedCookies.id;

    //   try {
    //     // Verify the 'id' token using Firebase Admin SDK
    //     await admin.auth().verifyIdToken(idToken);
    //   } catch (error) {
    //     // Log the specific details of the error
    //     console.error(error);

    //     // Render the login page in case of verification failure
    //     res.render('login');
    //     res.end();
    //   }
    // } else {
    //   // Handle the case when the 'id' cookie doesn't exist
    //   res.render('login');
    //   res.end();
    // }
  }
}
