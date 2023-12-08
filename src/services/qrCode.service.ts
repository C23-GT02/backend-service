// qr-code.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { StorageService } from './storage.service';
import { StorageContentType } from 'src/models/content-type.model';
import { url } from 'inspector';

@Injectable()
export class QrCodeService {
  constructor(private readonly storageService: StorageService) {}
  private readonly qrUrl = 'https://qrcode3.p.rapidapi.com/qrcode/text';
  private readonly rapidAPIKey =
    'f9861f8359mshcd8355461edaa4cp1be209jsn5f29b0f47d11';
  private readonly rapidHost = 'qrcode3.p.rapidapi.com';

  async generateQrCode(data: any, output: string = 'qrcode') {
    const options: any = {
      method: 'POST',
      url: this.qrUrl,
      headers: {
        'X-RapidAPI-Key': this.rapidAPIKey,
        'X-RapidAPI-Host': this.rapidHost,
      },
      data: {
        data,
        style: {
          module: {
            color: 'black',
            shape: 'heavyround',
          },
          inner_eye: {
            shape: 'heavyround',
          },
          outer_eye: {
            shape: 'lightround',
          },
        },
        size: {
          width: 400,
          quiet_zone: 4,
          error_correction: 'Q',
        },
        output: {
          filename: output,
          format: 'svg',
        },
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generateBatchQrCode(
    data: any,
    location: string,
  ): Promise<string | Error> {
    try {
      const qr = await this.generateQrCode(JSON.stringify(data), `${data.id}`);
      const url = await this.storageService.storeFile(
        qr,
        `${location}/${data.id}`,
        StorageContentType.SVG,
      );
      return url;
    } catch (error) {
      return error;
    }
  }
}
