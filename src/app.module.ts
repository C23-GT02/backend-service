import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginController, RegisterController } from './auth/auth.controller';
import { LoginService } from './auth/login.service';
import { RegisterService } from './auth/register.service';

@Module({
  imports: [],
  controllers: [AppController, LoginController, RegisterController],
  providers: [AppService, LoginService, RegisterService],
})
export class AppModule {}
