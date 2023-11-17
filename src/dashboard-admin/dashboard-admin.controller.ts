import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Render,
  ValidationPipe,
} from '@nestjs/common';
import { DashboardAdminService } from './dashboard-admin.service';
import { ApproverDTO } from './access.model';
import axios from 'axios';
@Controller('admin')
export class DashboardAdminController {
  private verifiedPartnerCollection: string = 'verifiedPartner';
  private unverifiedPartnerCollection: string = 'unverifiedPartner';
  private userCollection: string = 'users';

  constructor(
    private dasboardAdminService: DashboardAdminService, // private AccessDashboard: AccessDashboardService,
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
    const data = await this.dasboardAdminService.getPartnerById(
      this.verifiedPartnerCollection,
      id,
    );

    const imageURL =
      'https://storage.googleapis.com/tracker-64690.appspot.com/company-assets/Amati_Indonesia/amati-logo.png';

    // Fetch the image from the URL and convert it to base64
    const response = await axios.get(imageURL, { responseType: 'arraybuffer' });
    const image = Buffer.from(response.data, 'binary').toString('base64');

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
    const response = await axios.get(data.logo, {
      responseType: 'arraybuffer',
    });
    const image = Buffer.from(response.data, 'binary').toString('base64');
    console.log(data);

    return { data, image };
  }

  @Post('approval/:id')
  async approvePartner(@Param('id') id: string) {
    await this.dasboardAdminService.approved(
      this.unverifiedPartnerCollection,
      this.verifiedPartnerCollection,
      id,
    );
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
  async CreateApprover(@Body(new ValidationPipe()) body: ApproverDTO) {
    await this.dasboardAdminService.createApproverUser(body);
  }
}
