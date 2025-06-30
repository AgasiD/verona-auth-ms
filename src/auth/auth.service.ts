import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { encriptarPassword, generarJWT, getDataFromJSON, handlerError } from '../common/helpers/helper';

import { Usuario } from 'src/common/entities/usuarios/usuario.entity';
import { AuthRepository } from './auth.repository';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioRepository } from './usuario.repository';

@Injectable()
export class AuthService {


    uri: string;
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private readonly userRepo: UsuarioRepository,
        private readonly authRepo: AuthRepository
    ) {
        this.uri = process.env.GOOGLE_URI + '/usuario'
    }

    async saveUserAuth(usuario: CreateUsuarioDto) {
        // verificar que no exista TODO 
        await this.authRepo.create(usuario);
    }

    async cambiarPassword({ usuarioId, password, newpass }) {
        let usuario = (await this.authRepo.findOne(usuarioId))!;
        usuario.password = await encriptarPassword(newpass);
        await this.authRepo.updateOne(usuarioId, usuario);

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            needReLogIn: usuario.needReLogIn,
        };

    }

    async updateUser(usuario) {
        await this.authRepo.updateOne(usuario.id, usuario);
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            needReLogIn: usuario.needReLogIn,
        };
    }



    async generarUsuario(usuario: Usuario) {
        const usuarios = await this.userRepo.findAll();
        const username = this.generarUsername(usuarios, usuario)
        const encryptPassword = await encriptarPassword(usuario.password)
        return {
            username,
            password: encryptPassword
        }
    }

    async loginUser(authData: LoginAuthDto) {
        try {

            let usuario = await this.obtenerUsuarioPassword(authData)
            let response = {
                id: usuario.userId!,
                apellido: usuario.apellido,
                nombre: usuario.nombre,
                username: usuario.username,
                role: usuario.role,
                token: await generarJWT(usuario.id, 744)
            };

            if (usuario.needReLogIn == true) await this.client.emit(`usuarios.notNeedReLogIn`, { usuarioId: usuario.id });

            return response;
        } catch (err) {
            throw err

        }
    }

    async fullfillAuth() {

        const usuarios = await this.userRepo.findAll()

        for (let usuario of usuarios) {
            const datos = {
                userId: usuario.id!,
                password: usuario.password,
                username: usuario.username,
                role: usuario.role,
                email: usuario.email,
                activo: usuario.activo,

            }
            if (usuario.id === '') {
                console.log(usuario)
            } else {
                let us = await this.authRepo.create(datos)
                const ids = Object.keys(us)
                let user_data = us[ids[0]];
                await this.authRepo.updateOne(usuario.id, datos)
            }
        }
    }

    async obtenerUsuarioPassword({ username, password }) {

        let usuarios = await this.authRepo.findAll();

        // let encryptPassword = await encriptarPassword(password);
        let encryptPassword = password;
        const usuario = usuarios.find(user => user.username.toUpperCase() == username.trim().toUpperCase() && user.password == encryptPassword && user.activo);
        if (!usuario) throw new RpcException({ status: 404, message: 'Usuario y/o contraseña incorrectos' })
        return usuario

    }

    private generarUsername(usuarios: Usuario[], usuario: Usuario) {

        try {
            let nombre_usuario = usuario.nombre.toLowerCase().trim().substring(0, 1) + usuario.apellido.split(' ')[0].toLowerCase().trim();
            let existe = this.existeUsuario(usuarios, nombre_usuario);
            let i = 0;
            if (existe) {
                while (existe) {
                    if (i < usuario.nombre.length) {
                        nombre_usuario = usuario.nombre.toLowerCase().trim().substring(0, i + 1) + usuario.apellido.toLowerCase().trim()
                    } else {
                        let existeAux = true;
                        let iaux = 0;
                        while (existeAux) {
                            nombre_usuario = usuario.nombre.toLowerCase().trim().substring(0, i + 1) + usuario.apellido.toLowerCase().trim() + iaux;
                            existeAux = this.existeUsuario(usuarios, nombre_usuario);
                            iaux++;
                        }
                    }
                    existe = this.existeUsuario(usuarios, nombre_usuario);
                    i++;
                }
            }
            return nombre_usuario;
        } catch (err) {
            console.log('Error al generar username');
            throw err
        }
    }

    private existeUsuario(usuarios: any[], nombre_usuario: string) {
        return usuarios.findIndex(x => x.username === nombre_usuario) > -1;
    }


}
