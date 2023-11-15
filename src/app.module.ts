import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginController, RegisterController } from './auth/auth.controller';
import { LoginService } from './auth/login.service';
import { RegisterService } from './auth/register.service';
import { DashboardAdminController } from './dashboard-admin/dashboard-admin.controller';
import { DashboardAdminService } from './dashboard-admin/dashboard-admin.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    LoginController,
    RegisterController,
    DashboardAdminController,
  ],
  providers: [AppService, LoginService, RegisterService, DashboardAdminService],
})
export class AppModule {}
