import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Role } from 'src/auth/guard/roles.enum';
import { LoginService } from 'src/auth/login.service';
import { RegisterService } from 'src/auth/register.service';
import { admin, cookieOptions } from 'src/main';
import { LoginUserModel } from 'src/models/login.model';
import { RegisterModelMobile } from 'src/models/register.model';

@Controller('api')
export class ApiController {
  constructor(
    private readonly loginService: LoginService,
    private readonly registerService: RegisterService,
  ) {}

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
      const userData = await this.registerService.registerUserMobile(data);
      res.status(HttpStatus.OK).send({
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
}
