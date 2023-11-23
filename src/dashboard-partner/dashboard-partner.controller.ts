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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DashboardPartnerService } from './dashboard-partner.service';
import { createProductModel } from './product.model';
import { RegisterService } from 'src/auth/register.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { idCookie } from 'src/auth/cookies.model';
import { CookieAuthGuard } from 'src/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from 'src/auth/guard/roles.enum';

@Controller('partner')
export class DashboardPartnerController {
  constructor(
    private partnerService: DashboardPartnerService,
    private registerService: RegisterService,
  ) {}

  @UseGuards(CookieAuthGuard, RolesGuard)
  @Roles(Role.Partner)
  // @Render('partner-product')
  @Render('product')
  @Get()
  async partnerProduct() {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async registerUser(
    @Body() body: createProductModel,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    images: Express.Multer.File[],
    @Req() req: Request,
  ) {
    console.log(body);
    body.harga = parseInt(body.harga);
    const { businessName }: idCookie = req.signedCookies.id;
    const path = `${businessName}/products/${body.name}`;

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        return await this.registerService.storeImage(path, image);
      }),
    );
    body.tags = body.tags.split(',').map((val) => val);
    body.images = imageUrls;

    const data = await this.partnerService.createProduct(businessName, body);

    return data;
  }

  @Get(':id')
  async Product(@Param('id') id: string) {
    const data = await this.partnerService.getAllPartnerProducts(id);
    return data;
  }
}
