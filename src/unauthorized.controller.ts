// unauthorized-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof UnauthorizedException) {
      // Redirect to another site when the authentication fails.
      response.redirect(`http://localhost:${process.env.PORT ?? 3000}/`);
    } else {
      response.status(500).json({
        message: 'Internal server error',
      });
    }
  }
}
