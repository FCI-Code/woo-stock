import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { EncryptionService } from '../common/encryption/encryption.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async create(dto: CreateTenantDto) {
    const apiKey = randomBytes(32).toString('hex');
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');
    const webhookSecret = randomBytes(20).toString('hex');

    try {
      const tenant = await this.prisma.tenant.create({
        data: {
          store_url: dto.store_url,
          name: dto.name,
          api_key_hash: apiKeyHash,
          webhook_secret: webhookSecret,
          status: 'active',
          origin_zip: dto.origin_zip,
          origin_address: (dto.origin_address ?? null) as Prisma.InputJsonValue | null,
          woo_consumer_key_encrypted: dto.woo_consumer_key
            ? this.encryption.encrypt(dto.woo_consumer_key)
            : null,
          woo_consumer_secret_encrypted: dto.woo_consumer_secret
            ? this.encryption.encrypt(dto.woo_consumer_secret)
            : null,
          melhor_envio_token_encrypted: dto.melhor_envio_token
            ? this.encryption.encrypt(dto.melhor_envio_token)
            : null,
        },
      });

      const { api_key_hash: _, ...rest } = tenant;
      const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
      const webhookUrl = `${appUrl}/webhooks/woocommerce/${tenant.id}`;
      return {
        ...rest,
        api_key: apiKey,
        webhook_secret: webhookSecret,
        webhook_url: webhookUrl,
      };
    } catch (e: unknown) {
      const isUniqueViolation =
        e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2002';
      if (isUniqueViolation) {
        throw new ConflictException('A tenant with this store URL already exists');
      }
      throw e;
    }
  }

  async findMe(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');

    return this.sanitize(tenant);
  }

  async update(tenantId: string, dto: UpdateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existing) throw new NotFoundException('Tenant not found');

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.store_url !== undefined && { store_url: dto.store_url }),
        ...(dto.origin_zip !== undefined && { origin_zip: dto.origin_zip }),
        ...(dto.origin_address !== undefined && {
          origin_address: dto.origin_address as Prisma.InputJsonValue,
        }),
        ...(dto.woo_consumer_key !== undefined && {
          woo_consumer_key_encrypted: this.encryption.encrypt(dto.woo_consumer_key),
        }),
        ...(dto.woo_consumer_secret !== undefined && {
          woo_consumer_secret_encrypted: this.encryption.encrypt(dto.woo_consumer_secret),
        }),
        ...(dto.melhor_envio_token !== undefined && {
          melhor_envio_token_encrypted: this.encryption.encrypt(dto.melhor_envio_token),
        }),
      },
    });

    return this.sanitize(updated);
  }

  private sanitize(tenant: Awaited<ReturnType<typeof this.prisma.tenant.findUniqueOrThrow>>) {
    const {
      api_key_hash: _,
      webhook_secret: __,
      woo_consumer_key_encrypted,
      woo_consumer_secret_encrypted,
      melhor_envio_token_encrypted,
      ...rest
    } = tenant;

    return {
      ...rest,
      woo_consumer_key: woo_consumer_key_encrypted
        ? this.encryption.decrypt(woo_consumer_key_encrypted)
        : null,
      woo_consumer_secret: woo_consumer_secret_encrypted
        ? this.encryption.decrypt(woo_consumer_secret_encrypted)
        : null,
      melhor_envio_token: melhor_envio_token_encrypted
        ? this.encryption.decrypt(melhor_envio_token_encrypted)
        : null,
    };
  }
}
