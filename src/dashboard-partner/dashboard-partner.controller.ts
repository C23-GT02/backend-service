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

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async registerUser(
    @Body() body: createProductModel,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    logo: Express.Multer.File,
    @Req() req: Request,
  ) {
    const cookie = req.signedCookies.
    // const { image } = body;
  }

  @Get(':id')
  async Product(@Param('product') id: string) {
    const data = await this.partnerService.getAllPartnerProducts(id);
    return data;
  }
}
