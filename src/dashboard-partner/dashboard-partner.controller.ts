import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Render,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DashboardPartnerService } from './dashboard-partner.service';
import { createProductModel } from './product.model';
import { RegisterService } from 'src/auth/register.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

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
