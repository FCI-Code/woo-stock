import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiSecurity('X-API-Key')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders for the tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list of orders' })
  findAll(@TenantId() tenantId: string, @Query() query: ListOrdersQueryDto) {
    return this.ordersService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail with associated shipment' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order with shipment if any' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.ordersService.findOne(tenantId, id);
  }
}
