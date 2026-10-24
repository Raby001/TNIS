import { registerAs } from "@nestjs/config";
import { StringValue } from 'ms';

export default registerAs('jwt', ()=>({
  
  secret: process.env.JWT_SECRET,

  accessTokenExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as StringValue,

  refreshTokenExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue,

}));