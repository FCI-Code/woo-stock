import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const encryptionKey = this.config.getOrThrow<string>('ENCRYPTION_KEY');
    this.key = scryptSync(encryptionKey, 'woostock-salt', 32);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  decrypt(encryptedValue: string): string {
    const [ivB64, authTagB64, dataB64] = encryptedValue.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(data) + decipher.final('utf8');
  }
}
