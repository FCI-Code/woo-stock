import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { ShipmentsService } from './shipments.service';

@ApiTags('Shipments')
@ApiSecurity('X-API-Key')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a shipment' })
  @ApiBody({ type: CreateShipmentDto })
  @ApiResponse({ status: 201, description: 'Shipment created' })
  create(@TenantId() tenantId: string, @Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all shipments for the tenant' })
  @ApiQuery({ name: 'status', enum: ShipmentStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of shipments' })
  findAll(@TenantId() tenantId: string, @Query() query: ListShipmentsQueryDto) {
    return this.shipmentsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment details with tracking history' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment with events' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.shipmentsService.findOne(tenantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update shipment status and add tracking event' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiBody({ type: UpdateShipmentStatusDto })
  @ApiResponse({ status: 200, description: 'Updated shipment and new event' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateStatus(tenantId, id, dto);
  }
}
