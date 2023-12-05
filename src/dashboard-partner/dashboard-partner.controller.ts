import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  Render,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DashboardPartnerService } from './dashboard-partner.service';
import { createProductModel } from '../models/product.model';
import { RegisterService } from 'src/auth/register.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { idCookie } from 'src/auth/cookies.model';
import { QrCodeService } from '../services/qrCode.service';
import { StorageService } from 'src/services/storage.service';
import { admin } from 'src/main';
import { nanoid } from 'nanoid';

@Controller('partner')
export class DashboardPartnerController {
  constructor(
    private readonly partnerService: DashboardPartnerService,
    private readonly registerService: RegisterService,
    private readonly qrCodeService: QrCodeService,
    private readonly storageService: StorageService,
  ) {}

  private partnerCollection: string = 'verifiedPartner';
  private productsCollection: string = 'products';
  // @UseGuards(CookieAuthGuard, RolesGuard)
  // @Roles(Role.Partner)
  // @Render('partner-product')
  @Render('product')
  @Get()
  async partnerProduct() {
    // const { businessName }: idCookie = req.signedCookies.id;
    // // if (businessName != null) {
    // //   res.redirect(`partner/${businessName}`);
    // // } else {
    // //   return 'partner not found';
    // // }
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async registerUser(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    images: Express.Multer.File[],
    @Body() body: createProductModel,
    @Req() req: Request,
  ) {
    const { harga, name, packaging, proses, deskripsi, material, tags, stock } =
      body;

    body.harga = parseInt(harga); // convert string to number
    body.stock = parseInt(stock);

    const qrPayload = {
      name,
      harga,
      deskripsi,
      tags,
      material,
      proses,
      packaging,
    };
    const { businessName }: idCookie = req.signedCookies.id;

    const path = `${businessName}/products/${name}`;
    const qrPath = `${path}/${name}`;
    const partnerRef = `${this.partnerCollection}/${businessName}`;
    const productRef = `${partnerRef}/products/${name}`;

    const data: any[] = [];

    for (let i = 0; i < body.stock; i++) {
      const id = nanoid(10);
      data.push({ id, name, partnerRef, productRef });

      await admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(businessName)
        .collection(this.productsCollection)
        .doc(name)
        .collection('product-id')
        .doc(id)
        .set(data[i]);
    }

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        return await this.registerService.storeImage(path, image);
      }),
    );

    body.images = imageUrls;

    body.tags = body.tags.split(',').map((val) => val); // make the tags an array

    const qr = await this.qrCodeService.generateQrCode(
      JSON.stringify(qrPayload),
    );
    body.qrcodeURL = await this.storageService.storeFile(qr, qrPath);

    await this.qrCodeService.generateBatchQrCode(body.stock, data, qrPath);

    const create = await this.partnerService.createProduct(businessName, body);

    await admin
      .firestore()
      .collection(this.productsCollection)
      .doc(name)
      .set({ productRef, partnerRef });

    return create;
  }

  @Get('profile')
  @Render('partner-profile')
  async partnerProfile() {}

  @Get('/edit')
  @Render('partner-edit')
  async editPartnerProfile() {}
}
