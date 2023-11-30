import { Controller, Get, Render } from '@nestjs/common';
import { DashboardPartnerService } from './dashboard-partner.service';
import { RegisterService } from 'src/auth/register.service';

@Controller('partner')
export class DashboardPartnerController {
  constructor(
    private partnerService: DashboardPartnerService,
    private registerService: RegisterService,
  ) {}

  @Render('partner-product')
  @Get()
  async partnerProduct() {}

  @Get('profile')
  @Render('partner-profile')
  async partnerProfile() {}

  @Get('/edit')
  @Render('partner-edit')
  async editPartnerProfile() {}
}
