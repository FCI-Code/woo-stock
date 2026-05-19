import { randomBytes } from 'crypto';

export function generateTrackingCode(): string {
  return 'WSK' + randomBytes(12).toString('base64url').toUpperCase().slice(0, 16);
}
