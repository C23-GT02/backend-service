// cookie-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { admin } from './main';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionCookie = request.signedCookies.session;
    const TokenCookie = request.signedCookies.id;

    // let decodedToken;

    // if (decodedToken && decodedToken == 'TokenCookie.idToken') {
    //   return true;
    // }

    if (sessionCookie) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(TokenCookie.idToken, true);
        if (decodedToken.uid) {
          return true;
        }
      } catch (error) {
        console.log(error);
        Logger.error(error.message, error.stack);
        throw new UnauthorizedException('Authentication failed');
      }
    }
    throw new UnauthorizedException('Authentication failed');
  }
}
