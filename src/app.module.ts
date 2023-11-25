import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginController, RegisterController } from './auth/auth.controller';
import { LoginService } from './auth/login.service';
import { RegisterService } from './auth/register.service';
import { DashboardAdminController } from './dashboard-admin/dashboard-admin.controller';
import { DashboardAdminService } from './dashboard-admin/dashboard-admin.service';
import { AdminAccessService } from './dashboard-admin/access.service';
import { DashboardPartnerController } from './dashboard-partner/dashboard-partner.controller';
import { DashboardPartnerService } from './dashboard-partner/dashboard-partner.service';
import { QrCodeService } from './services/qrCode.service';
import { StorageService } from './services/storage.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    LoginController,
    RegisterController,
    DashboardAdminController,
    DashboardPartnerController,
  ],
  providers: [
    AppService,
    LoginService,
    RegisterService,
    DashboardAdminService,
    AdminAccessService,
    DashboardPartnerService,
    QrCodeService,
    StorageService,
  ],
})
export class AppModule {}
