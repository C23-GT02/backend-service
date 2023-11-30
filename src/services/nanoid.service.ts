import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class NanoId {
  generateIdForQr(length: number) {
    return nanoid(length);
  }
}
