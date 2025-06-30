import { HttpStatus, Injectable } from "@nestjs/common";
import { encriptarPassword, getDataFromJSON } from "src/common/helpers/helper";
import { HttpService } from "src/common/services/http/http.service";
import { UserFactory } from "./entities/usuario.factory";
import { RpcException } from "@nestjs/microservices";
import { Usuario } from "./entities/usuario.entity";
import { UserAuthInterface } from "./interfaces/UserAuth.intercace";


@Injectable()
export class AuthRepository {


    BASE_URL: string;
    URI: string;
    usuarios: Usuario[]
    constructor(private readonly http: HttpService) {
        this.BASE_URL = process.env.GOOGLE_URI!;
        this.URI = this.BASE_URL + '/auth'
    }

    async findOne(id) {
        let usuario;
        let datos = (await this.http.get(this.URI + `/${id}.json`)).data;
        if (datos == null) throw new RpcException({ status: 404, message: `Usuario id ${id} no encontrado` })
        // const ids = Object.keys(datos)
        // let user_data = datos[ids[0]];
        usuario = UserFactory.newUser({ id: datos.userId, ...datos })
        if (!usuario.activo) throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Usuario id ${id} no encontrado` })
        return usuario
    }

    async findAll() {
        let datos = (await this.http.get(this.URI + `.json`)).data;
        this.usuarios = getDataFromJSON(datos).map(data => UserFactory.newUser({ id: data.id, ...data.attributes }));
        if (!this.usuarios) throw new RpcException({ status: 400, message: 'Usuario y/o contraseña incorrectos' })

        return this.usuarios
    }

    async create(user: UserAuthInterface) {

        const headers = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        const response = await this.http.post(`${this.URI}/${user.userId}.json`, headers, {...user})
        if (response.status >= 300) throw new RpcException({ status: response.status, message: response.statusText });
        return response.data;
    }

    async updateOne(usuarioId: any, usuario: any) {
        const response = await this.http.patch(`${this.URI}/${usuarioId}.json`, {}, usuario)
        if (response.status >= 300) throw new RpcException({ status: response.status, message: response.statusText });
        return response.data;
    }




}