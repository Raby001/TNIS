import { Body, Controller, Get, Patch, Post, Req, UseGuards,} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags,} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ======================================================
  // Login
  // ======================================================

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate a user using username and password and return a JWT access token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive user.',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ======================================================
  // Refresh Token
  // ======================================================

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Use a valid refresh token to obtain a new access token and refresh token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or revoked refresh token.',
  })
  async refresh(
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(
      dto.refreshToken,
    );
  }

  // ======================================================
  // Logout
  // ======================================================

  @Post('logout')
  @ApiOperation({
    summary: 'Logout',
    description: 'Revokes the supplied refresh token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Logout successful.',
  })
  async logout(
    @Body() dto: RefreshTokenDto,
  ) {
    await this.authService.logout(
      dto.refreshToken,
    );

    return {
      message: 'Logout successful.',
    };
  }

  // ======================================================
  // Get user detail
  // ======================================================

  @Get('me')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: Request) {
    const user = request.user as { id: string };
    return this.authService.me(user.id);
  }

  // ======================================================
  // Update own profile
  // ======================================================

  @Patch('me')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() request: Request,
    @Body() dto: UpdateMyProfileDto,
  ) {
    const user = request.user as { id: string };
    return this.authService.updateMyProfile(user.id, dto);
  }

  // ======================================================
  // Change Password
  // ======================================================

  @Patch('me/password')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() request: Request,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = request.user as { id: string };
    await this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );

    return {
      message: 'Password changed successfully.',
    };
  }

}