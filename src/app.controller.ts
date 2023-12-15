import { Controller, Get, Redirect, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { idCookie } from './auth/cookies.model';
import { admin } from './main';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Redirect('/login')
  @Get()
  app() {}

  @Get('/signout')
  async userSignout(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.signedCookies.session) {
        res.redirect('/');
      }

      const { uid }: idCookie = req.signedCookies.id;

      // Revoke refresh tokens for the user
      await admin.auth().revokeRefreshTokens(uid);

      // Clear the user's session
      res.clearCookie('session');
      res.clearCookie('id');
      res.status(200).redirect('/');
    } catch (error) {
      console.error('Error revoking refresh tokens:', error);
      throw new Error('Failed to sign out the user.');
    }
  }
}
