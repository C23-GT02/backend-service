// qr-code.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { StorageService } from './storage.service';
import { StorageContentType } from 'src/models/content-type.model';

@Injectable()
export class QrCodeService {
  constructor(private readonly storageService: StorageService) {}
  private readonly qrUrl = process.env.qrURL;
  private readonly rapidAPIKey = process.env.rapidAPIKey;
  private readonly rapidHost = process.env.rapidHost;

  async generateQrCode(data: any, output: string = '') {
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
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generateBatchQrCode(qty: number, data: any[], location: string) {
    for (let index = 0; index < qty; index++) {
      const qr = await this.generateQrCode(
        JSON.stringify(data[index]),
        `${data[index].id}-${index}`,
      );
      console.log(qr);
      await this.storageService.storeFile(
        qr,
        `${location}/${data[index].id}`,
        StorageContentType.SVG,
      );
    }
  }
}
