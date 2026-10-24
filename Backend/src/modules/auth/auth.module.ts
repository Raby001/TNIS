import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule, ConfigService, ConfigType } from "@nestjs/config";
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from "src/config/jwt.config";
import { JwtStrategy } from "./strategies/jwt-strategy";
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../access-control/entities/role.entity";
import { RolePermission } from "../access-control/entities/role-permission.entity";
import { Permission } from "../access-control/entities/permission.entity";
import { AuthorizationService } from "../access-control/authorization.service";
import { PermissionsGuard } from "../access-control/guards/permissions.guard";
import { User } from "../users/entities/user.entity";
import { Province } from "../locations/entities/province.entity";
import { RefreshToken } from "./entities/refresh-token.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      User,
      Province,
      RefreshToken,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const jwt = configService.getOrThrow<ConfigType<typeof jwtConfig>>('jwt');

        return {
          secret: jwt.secret,
          signOptions: {
            expiresIn: jwt.accessTokenExpiresIn,
          }
        }
      }
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthorizationService, PermissionsGuard],
  exports: [AuthService, AuthorizationService, PermissionsGuard],
})
export class AuthModule{}