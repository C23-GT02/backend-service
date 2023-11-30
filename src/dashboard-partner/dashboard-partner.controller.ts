import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  Render,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DashboardPartnerService } from './dashboard-partner.service';
import { createProductModel } from '../models/product.model';
import { RegisterService } from 'src/auth/register.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
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
  async partnerProduct(@Req() req: Request, @Res() res: Response) {
    // const { businessName }: idCookie = req.signedCookies.id;
    // // if (businessName != null) {
    // //   res.redirect(`partner/${businessName}`);
    // // } else {
    // //   return 'partner not found';
    // // }
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // html name attribute and max image uploaded
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
    body.harga = parseInt(body.harga); // convert string to number
    body.stock = parseInt(body.stock);

    const { harga, name, packaging, proses, deskripsi, material, tags } = body;

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
    const path = `${businessName}/products/${body.name}`;
    const qrPath = `${path}/${body.name}`;
    const qrBatchPath = `${path}/${body.name}`;

    const data: any[] = [];

    for (let i = 0; i < body.stock; i++) {
      const id = nanoid(10);
      data.push({
        id,
        name: body.name,
      });
      await admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(businessName)
        .collection(this.productsCollection)
        .doc(body.name)
        .collection('product-id')
        .doc(id)
        .set(data[i]);
    }

    // return imageURL to be stored in array
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        return await this.registerService.storeImage(path, image);
      }),
    );

    body.images = imageUrls;

    // make the tags to be array type
    body.tags = await body.tags.split(',').map((val) => val);

    const qr = await this.qrCodeService.generateQrCode(
      JSON.stringify(qrPayload),
    );
    body.qrcodeURL = await this.storageService.storeFile(qr, qrPath);

    // Generate batch QR codes
    await this.qrCodeService.generateBatchQrCode(body.stock, data, qrBatchPath);

    const create = await this.partnerService.createProduct(businessName, body);
    return create;
  }
    body.harga = parseInt(body.harga); // convert string to number
    body.stock = parseInt(body.stock);

    const { harga, name, packaging, proses, deskripsi, material, tags } = body;

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
    const path = `${businessName}/products/${body.name}`;
    const qrPath = `${path}/${body.name}`;
    const qrBatchPath = `${path}/${body.name}`;

    const data: any[] = [];

    for (let i = 0; i < body.stock; i++) {
      const id = nanoid(10);
      data.push({
        id,
        name: body.name,
      });
      await admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(businessName)
        .collection(this.productsCollection)
        .doc(body.name)
        .collection('product-id')
        .doc(id)
        .set(data[i]);
    }

    // return imageURL to be stored in array
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        return await this.registerService.storeImage(path, image);
      }),
    );

    body.images = imageUrls;

    // make the tags to be array type
    body.tags = await body.tags.split(',').map((val) => val);

    const qr = await this.qrCodeService.generateQrCode(
      JSON.stringify(qrPayload),
    );
    body.qrcodeURL = await this.storageService.storeFile(qr, qrPath);

    // Generate batch QR codes
    await this.qrCodeService.generateBatchQrCode(body.stock, data, qrBatchPath);

    const create = await this.partnerService.createProduct(businessName, body);
    return create;
  }

  @Get('profile')
  @Render('partner-profile')
  async partnerProfile() {}

  @Get('/edit')
  @Render('partner-edit')
  async editPartnerProfile() {}
}
