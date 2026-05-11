import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Register a new tenant and receive an API key' })
  @ApiBody({ type: CreateTenantDto })
  @ApiResponse({ status: 201, description: 'Tenant created. Save the api_key — it will not be shown again.' })
  @ApiResponse({ status: 409, description: 'Store URL already registered' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get('me')
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'Get the authenticated tenant profile' })
  @ApiResponse({ status: 200, description: 'Tenant profile' })
  findMe(@TenantId() tenantId: string) {
    return this.tenantsService.findMe(tenantId);
  }

  @Patch('me')
  @ApiSecurity('X-API-Key')
  @ApiOperation({ summary: 'Update the authenticated tenant profile' })
  @ApiBody({ type: UpdateTenantDto })
  @ApiResponse({ status: 200, description: 'Updated tenant profile' })
  update(@TenantId() tenantId: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(tenantId, dto);
  }
}
