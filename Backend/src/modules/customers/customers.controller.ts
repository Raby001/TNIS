import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/modules/access-control/guards/permissions.guard';
import { Permissions } from 'src/modules/access-control/decorators/permissions.decorator';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  // ==================================================
  // Create
  // ==================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a customer',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Customer code already exists.',
  })
  create(
    @Body() dto: CreateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.create(dto);
  }

  // ==================================================
  // Get
  // ==================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all customers',
  })
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get('search')
  @Permissions('ASSET_READ')
  async search(
    @Query('search') search?: string,
  ) {
    return this.customersService.search(search);
  }  

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a customer',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the customer.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  // ==================================================
  // Edit
  // ==================================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a customer',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the customer.',
    type: String,
    format: 'uuid',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.update(id, dto);
  }

  // ==================================================
  // Delete
  // ==================================================


  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a customer',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the customer.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found.',
  })
  @ApiResponse({
    status: 409,
    description:'Customer cannot be deleted while an ONT references the customer.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.customersService.remove(id);
  }


}