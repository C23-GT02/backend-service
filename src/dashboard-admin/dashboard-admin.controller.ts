import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Render,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { DashboardAdminService } from './dashboard-admin.service';
import { ApproverDTO } from '../models/access.model';
import { Request, Response } from 'express';
import { RegisterUserModel } from 'src/models/register.model';
import { AdminAccessService } from './access.service';
import { CookieAuthGuard } from 'src/auth.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from 'src/auth/guard/roles.enum';
import { idCookie } from 'src/auth/cookies.model';
import { admin } from 'src/main';

@UseGuards(CookieAuthGuard)
// @Roles(Role.Admin, Role.Approver)
@Controller('admin')
export class DashboardAdminController {
  private verifiedPartnerCollection: string = 'verifiedPartner';
  private unverifiedPartnerCollection: string = 'unverifiedPartner';
  private userCollection: string = 'users';

  constructor(
    private dasboardAdminService: DashboardAdminService,
    private adminAccessService: AdminAccessService,
  ) {}

  @Redirect('/admin/partner')
  @Get()
  async redirectAdmin() {}

  @Get('partner')
  @Render('verified')
  async getVerifiedPartner() {
    const data = await this.dasboardAdminService.getAllDataWithinCollection(
      this.verifiedPartnerCollection,
    );
    return { data };
  }

  @Get('partner/:id')
  @Render('verified-partner')
  async getPartnerData(@Param('id') id: string) {
    const data: RegisterUserModel =
      await this.dasboardAdminService.getPartnerById(
        this.verifiedPartnerCollection,
        id,
      );

    const image = await this.dasboardAdminService.loadImage(data.logo);

    return { data, image };
  }

  @Get('approval')
  @Render('unverified')
  async getUnverifiedPartner() {
    const data = await this.dasboardAdminService.getAllDataWithinCollection(
      this.unverifiedPartnerCollection,
    );
    return { data };
  }

  @Render('unverifiedPartner')
  @Get('approval/:id')
  async getUnverifiedPartnerDetails(@Param('id') id: string) {
    const data = await this.dasboardAdminService.getPartnerById(
      this.unverifiedPartnerCollection,
      id,
    );
    const image = await this.dasboardAdminService.loadImage(data.logo);

    return { data, image };
  }

  @Post('approval/:id')
  async approvePartner(@Param('id') id: string, @Res() res: Response) {
    await this.dasboardAdminService.approved(
      this.unverifiedPartnerCollection,
      this.verifiedPartnerCollection,
      id,
    );
    res.redirect('/admin/approval');
  }

  @Get('access')
  @Render('access')
  async getAccessPage() {
    const data = await this.dasboardAdminService.getAllDataWithinCollection(
      this.userCollection,
    );
    const emails = await this.dasboardAdminService.getAllUsers();
    return { data: data, email: emails };
  }

  @Redirect('/admin/access')
  @Post('access')
  async CreateUserRole(
    @Body(new ValidationPipe({ transform: true })) body: ApproverDTO,
  ) {
    await this.adminAccessService.createUserRole(body);
  }

  @Post('access/delete')
  async DeleteUserRole(@Body('email') email: string, @Res() res: Response) {
    await this.adminAccessService.deleteUserRole(email);
    res.redirect('/admin/access');
  }
}
