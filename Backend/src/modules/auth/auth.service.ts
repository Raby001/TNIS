import { Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { Province } from '../locations/entities/province.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { createHash, randomBytes } from 'crypto';
import ms from 'ms';
import { ConfigService, ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>
  ) {}

  // ==========================================================
  // Helper Method
  // ==========================================================
  
  private hashRefreshToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  // ==========================================================
  // Login
  // ==========================================================

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(
      loginDto.username,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid username or password',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account is inactive',
      );
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid username or password',
      );
    }

    const payload = {
      sub: user.id,
    };

    // ==========================================
    // JWT Config
    // ==========================================

    const jwt = this.configService.getOrThrow<ConfigType<typeof jwtConfig>>('jwt');

    // ==========================================
    // Access Token
    // ==========================================

    const accessToken = await this.jwtService.signAsync(payload);

    // ==========================================
    // Refresh Token
    // ==========================================

    const refreshToken =  this.generateRefreshToken();

    const tokenHash = this.hashRefreshToken(refreshToken);

    const refreshTokenEntity = this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(
          Date.now() + ms(jwt.refreshTokenExpiresIn),
        ),
        revokedAt: null,
      });

    await this.refreshTokenRepository.save(
      refreshTokenEntity,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // ==========================================================
  // Logout
  // ==========================================================
  

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
        where: {
          tokenHash,
        },
      });

    if (!storedToken) {
      return;
    }

    if (!storedToken.revokedAt) {
      storedToken.revokedAt = new Date();

      await this.refreshTokenRepository.save(
        storedToken,
      );
    }
  }

  // ==========================================================
  // Refresh
  // ==========================================================
  
  async refresh(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
        where: {
          tokenHash,
        },
        relations: {
          user: true,
        },
      });

    if (!storedToken) {
      throw new UnauthorizedException(
        'Invalid refresh token.',
      );
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException(
        'Refresh token has been revoked.',
      );
    }

    if (storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException(
        'Refresh token has expired.',
      );
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException(
        'User account is inactive.',
      );
    }

    // ==========================================
    // Revoke old refresh token
    // ==========================================

    storedToken.revokedAt = new Date();

    await this.refreshTokenRepository.save(
      storedToken,
    );

    // ==========================================
    // New access token
    // ==========================================

    const payload = {
      sub: storedToken.user.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // ==========================================
    // New refresh token
    // ==========================================

    const newRefreshToken = this.generateRefreshToken();

    const newTokenHash = this.hashRefreshToken(newRefreshToken);

    const newRefreshTokenEntity = this.refreshTokenRepository.create({
        userId: storedToken.user.id,
        tokenHash: newTokenHash,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
        revokedAt: null,
      });

    await this.refreshTokenRepository.save(
      newRefreshTokenEntity,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ==========================================================
  // User detail
  // ==========================================================

  async me(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return user;
  }
  
  // ==========================================================
  // Update User Profile
  // ==========================================================

  async updateMyProfile(
    userId: string,
    dto: UpdateMyProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (dto.username !== undefined) {
      user.username = dto.username;
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    if (dto.provinceId !== undefined) {
      const province = await this.provinceRepository.findOne({
        where: { id: dto.provinceId },
      });

      if (!province) {
        throw new NotFoundException(
          `Province with ID ${dto.provinceId} not found.`,
        );
      }

      user.provinceId = province.id;
      user.province = province;
    }

    return this.userRepository.save(user);
  }

  // ==========================================================
  // Change Password
  // ==========================================================

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();


    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await this.userRepository.save(user);
  }

}