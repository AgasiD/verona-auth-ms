import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpService } from 'src/common/services/http/http.service';
import { NatsModule } from 'src/nats/nats.module';
import { UsuarioRepository } from './usuario.repository';
import { AuthRepository } from './auth.repository';


@Module({
  controllers: [AuthController],
  providers: [AuthService, HttpService, UsuarioRepository, AuthRepository],
  imports: [NatsModule]
})
export class AuthModule {}
