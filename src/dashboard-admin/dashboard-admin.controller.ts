import { Controller, Get, Param, ParamData, Redirect, Render } from '@nestjs/common';
import { DashboardAdminService } from './dashboard-admin.service';

@Controller('admin')
export class DashboardAdminController {
  private verifiedPartnerCollection: string = 'verifiedPartner';
  private unverifiedPartnerCollection: string = 'unverifiedPartner';
  private userCollection: string = 'users';

  constructor(
    private dasboardAdminService: DashboardAdminService, // private AccessDashboard: AccessDashboardService,
  ) {}

  @Redirect('/admin/patner')
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
  @Render('unverifiedPartner')
  async getPartnerData(@Param('id') id: string) {
    const data = await this.dasboardAdminService.getPartnerById(
      this.verifiedPartnerCollection,
      id,
    );
    return data;
  }

  @Get('approval')
  @Render('unverified')
  async getUnverifiedPartner() {
    const data = await this.dasboardAdminService.getAllDataWithinCollection(
      this.unverifiedPartnerCollection,
    );
    return { data };
  }

  @Get('access')
  @Render('access')
  async getAccessPage() {
    const data = await this.dasboardAdminService.getAllDataWithinCollection(
      this.userCollection,
    );
    return { data };
  }
}
