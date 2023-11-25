import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { admin } from 'src/main';

@Injectable()
export class NanoId {
  generateIdForQr(length: number) {
    return nanoid(length);
  }
}
