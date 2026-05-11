import {
  CanActivate,
  ExecutionContext,
  Injectable,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WoocommerceSignatureGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
    const params = request.params as { tenantId?: string };
    const tenantId = params.tenantId;
    const signature = request.headers['x-wc-webhook-signature'] as string | undefined;
    const rawBody = request.rawBody;

    if (!tenantId || !signature || !rawBody) {
      throw new UnauthorizedException();
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, webhook_secret: true, status: true },
    });

    if (!tenant || tenant.status !== 'active') {
      throw new UnauthorizedException();
    }

    const expected = createHmac('sha256', tenant.webhook_secret)
      .update(rawBody)
      .digest();
    const provided = Buffer.from(signature, 'base64');

    if (
      expected.length !== provided.length ||
      !timingSafeEqual(expected, provided)
    ) {
      throw new UnauthorizedException();
    }

    request.tenantId = tenant.id;
    return true;
  }
}
