import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  ParseFilePipe,
  Post,
  Render,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DashboardPartnerService } from './dashboard-partner.service';
import { createProductModel } from '../models/product.model';
import { RegisterService } from 'src/auth/register.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { idCookie } from 'src/auth/cookies.model';
import { QrCodeService } from '../services/qrCode.service';
import { StorageService } from 'src/services/storage.service';
import { admin } from 'src/main';
import { nanoid } from 'nanoid';
import { MemberModel } from 'src/models/founder.model';
import { DashboardAdminService } from 'src/dashboard-admin/dashboard-admin.service';

@Controller('partner')
export class DashboardPartnerController {
  constructor(
    private readonly partnerService: DashboardPartnerService,
    private readonly registerService: RegisterService,
    private readonly qrCodeService: QrCodeService,
    private readonly storageService: StorageService,
    private readonly adminService: DashboardAdminService,
  ) {}

  private readonly partnerCollection: string = 'verifiedPartner';
  private readonly productsCollection: string = 'products';
  private readonly historyCollection: string = 'history';
  private readonly employeeCollection: string = 'employee';
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
  async registerProduct(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image' })],
      }),
    )
    images: Express.Multer.File[],
    @Body() body: createProductModel,
    @Req() req: Request,
    @Res() res: Response,
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

    for (let i = 0; i < body.stock; i++) {
      const id = nanoid(10);
      const documentData = { id, name, partnerRef, productRef };

      await admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(businessName)
        .collection(this.productsCollection)
        .doc(name)
        .collection('product-id')
        .doc(id)
        .set(documentData, { merge: true });

      const qrPayload = JSON.stringify(documentData);
      const qr = await this.qrCodeService.generateBatchQrCode(
        qrPayload,
        qrPath,
      );
      console.log(qr);
      await admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(businessName)
        .collection(this.productsCollection)
        .doc(name)
        .collection('product-id')
        .doc(id)
        .set({ qr }, { merge: true });
    }

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        return await this.registerService.storeImage(path, image);
      }),
    );

    console.log({ cp: imageUrls });

    body.images = imageUrls;

    body.tags = body.tags.split(',').map((val) => val); // make the tags an array

    const qr = await this.qrCodeService.generateQrCode(
      JSON.stringify(qrPayload),
    );

    console.log({ cpp: qr });
    body.qrcodeURL = await this.storageService.storeFile(qr, qrPath);

    await this.partnerService.createProduct(businessName, body);

    await admin
      .firestore()
      .collection(this.productsCollection)
      .doc(name)
      .set({ productRef, partnerRef });

    res.status(HttpStatus.CREATED).redirect('partner/profile');
  }

  @Get('products')
  @Render('partner-product')
  async getPartnerProducts() {}

  @Get('products/jamu')
  @Render('product-list')
  async getProductList() {}

  @Get('profile')
  @Render('partner-profile-revisi')
  async partnerProfile(@Req() req: Request) {
    try {
      const { businessName }: idCookie = req.signedCookies.id;
      const partnerRef = `${this.partnerCollection}/${businessName}`;
      const employeeCollectionRef = `${partnerRef}/${this.employeeCollection}`;

      // Concurrently fetch partner and employee data
      const [partner, counter, employee] = await Promise.all([
        this.partnerService.getDocumentFromRef(partnerRef),
        this.partnerService.countData(businessName),
        this.partnerService.getCollectionDataFromRef(employeeCollectionRef),
      ]);

      // Load partner logo concurrently
      if (partner && partner.logo) {
        partner.logo = await this.adminService.loadImage(partner.logo);
      }

      return { partner, counter, employee };
    } catch (error) {
      // Handle errors appropriately
      console.error('Error fetching partner profile:', error);
      throw error;
    }
  }

  @Post('profile/update')
  async updatePartner(@Req() req: Request, @Body() data, @Res() res: Response) {
    try {
      const { businessName }: idCookie = req.signedCookies.id;
      const path = `${this.partnerCollection}/${businessName}`;
      await this.partnerService.setOrUpdateDocument(path, data);
      res.status(HttpStatus.OK).redirect('/partner/profile');
    } catch (error) {
      return error;
    }
  }

  @Get('profile/employee')
  @Render('create-employee')
  async createPartnerProfile() {}

  @UseInterceptors(FileInterceptor('image'))
  @Post('profile/employee')
  async addEmployee(
    @Req() req: Request,
    @Body() employee: MemberModel,
    @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const { businessName }: idCookie = req.signedCookies.id;
      const { name } = employee;
      const partnerRef = `${this.partnerCollection}/${businessName}`;

      const imagePath = `${businessName}/${this.employeeCollection}/${name}`;

      employee.image = await this.storageService.storeFile(
        image.buffer,
        imagePath,
        image.mimetype,
      );
      const ref = `${this.partnerCollection}/${businessName}/${this.employeeCollection}/${name}`;

      await this.partnerService.setOrUpdateDocument(ref, employee);
      await this.partnerService.setOrUpdateDocument(partnerRef, {
        lastUpdate: new Date().toISOString(),
      });

      res.status(HttpStatus.CREATED).redirect('/partner/profile');
    } catch (error) {
      return error;
    }
  }

  @Post('profile/employee/update')
  async updateEmployee(
    @Req() req: Request,
    @Body() data: MemberModel,
    @Res() res: Response,
  ) {
    try {
      const { businessName }: idCookie = req.signedCookies.id;
      const { name } = data;
      const path = `${this.partnerCollection}/${businessName}/${this.employeeCollection}/${name}`;
      await this.partnerService.setOrUpdateDocument(path, data);
      res.status(HttpStatus.OK).redirect('/partner/profile');
    } catch (error) {
      return error;
    }
  }

  @Get('history')
  @Render('history-revisi')
  async getHistory(@Req() req: Request) {
    const { businessName }: idCookie = req.signedCookies.id;
    try {
      const collectionRef = admin
        .firestore()
        .collection(this.partnerCollection)
        .doc(businessName)
        .collection(this.historyCollection);
      const snapshot = await collectionRef.get();
      const data = snapshot.docs.map((doc) => {
        return { ...doc.data() }; // Include document ID in the result
      });
      return { history: data };
    } catch (error) {
      return error;
    }
  }
}
