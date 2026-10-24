import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { Permissions } from "../access-control/decorators/permissions.decorator";
import { PermissionsGuard } from "../access-control/guards/permissions.guard";
import { UserQueryDto } from "./dto/user-query.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ========================================================
  // Create user
  // ========================================================

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER_CREATE')
  @ApiOperation({
    summary: 'Create a user',
    description: 'Create a new user account and assign a role and province.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'User is not authenticated.',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have USER_CREATE permission.',
  })
  @ApiResponse({
    status: 409,
    description: 'Username already exists.',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }


  // ========================================================
  // Get User
  // ========================================================

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER_READ')
  @ApiOperation({
    summary: 'Get users',
    description: 'Get a paginated list of users with optional search, filtering, and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'User is not authenticated.',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have USER_READ permission.',
  })
  async findAll(
    @Query() query: UserQueryDto,
  ) {
    return this.usersService.findAll(query);
  }

  // ========================================================
  // Get User by id
  // ========================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER_READ')
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Retrieve a specific user by their ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'User is not authenticated.',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have USER_READ permission.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ========================================================
  // update user by id
  // ========================================================

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER_UPDATE')
  @ApiOperation({
    summary: 'Update a user',
    description: 'Update one or more fields of an existing user.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'User is not authenticated.',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have USER_UPDATE permission.',
  })
  @ApiResponse({
    status: 404,
    description: 'User, role, or province was not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Username already exists.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // ========================================================
  // Delete User by id
  // ========================================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER_DELETE')
  @ApiOperation({
    summary: 'Deactivate a user',
    description: 'Deactivate a user account without permanently deleting the user record.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'User is not authenticated.',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have USER_DELETE permission.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async remove(
    @Param('id') id: string,
  ) {
    await this.usersService.remove(id);

    return {
      message: 'User deactivated successfully',
    };
}  

}