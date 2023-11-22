import { Controller, Get, Render } from '@nestjs/common';

@Controller('partner')
export class DashboardPartnerController {
  @Render('partner-product')
  @Get()
  async render() {}
}
