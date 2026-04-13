import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  hashKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  async findTenantByKey(apiKey: string): Promise<Tenant | null> {
    const hash = this.hashKey(apiKey);
    return this.prisma.tenant.findUnique({ where: { api_key_hash: hash } });
  }
}
