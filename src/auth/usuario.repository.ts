import { Injectable } from "@nestjs/common";
import { encriptarPassword, getDataFromJSON } from "src/common/helpers/helper";
import { HttpService } from "src/common/services/http/http.service";
import { UserFactory } from "./entities/usuario.factory";
import { RpcException } from "@nestjs/microservices";
import { Usuario } from "./entities/usuario.entity";

@Injectable()
export class UsuarioRepository {

    BASE_URL: string;
    URI: string;
    usuarios: Usuario[]
    constructor(private readonly http: HttpService) {
        this.BASE_URL = process.env.GOOGLE_URI!;
        this.URI = this.BASE_URL + '/usuario'

    }

    async findOne(id) {
        let usuario;

        let datos = (await this.http.get(this.URI + `/${id}.json`)).data;
        if (datos == null) throw new RpcException({ status: 404, message: `Usuario id ${id} no encontrado` })
        const json_data = getDataFromJSON(datos)[0];
        usuario = UserFactory.newUser({ id: json_data.id, ...json_data.attributes })
        if (!usuario.activo) throw new RpcException({ status: 404, message: `Usuario id ${id} no encontrado` })
        return usuario



    }

    async findAll() {
        let datos = (await this.http.get(this.URI + `.json`)).data;
        this.usuarios = getDataFromJSON(datos).map(data => UserFactory.newUser({ id: data.id, ...data.attributes }));
        if (!this.usuarios) throw new RpcException({ status: 400, message: 'Usuario y/o contraseña incorrectos' })

        return this.usuarios
    }

}