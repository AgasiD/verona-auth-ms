import { Controller, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @MessagePattern('auth.create')
  @EventPattern('auth.create')
  async createUserAuth(@Payload() payload: CreateUsuarioDto) {
    return await this.authService.saveUserAuth(payload)
  }

  @MessagePattern('auth.login')
  async login(@Payload() payload: LoginAuthDto) {
    return await this.authService.loginUser(payload)
  }

  @MessagePattern('auth.generateUser')
  async generarUsuario(@Payload() payload) {

    return await this.authService.generarUsuario(payload);
  }
  @EventPattern('auth.fullfillAuth')
  async fullfillAuth() {
    await this.authService.fullfillAuth()
  }

  @EventPattern('auth.actualizarUser')
    async actualizarUser(@Payload() payload){
      await this.authService.updateUser(payload)
  }

  @MessagePattern('auth.cambiarPassword')
  async cambiarPassword(@Payload() payload) {
    return await this.authService.cambiarPassword(payload)
  }

}
