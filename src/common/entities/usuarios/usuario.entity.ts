
export class Usuario {

    id?: string
    userId?: string
    nombre: string
    apellido: string
    email: string
    telefono: string
    role: any
    dni: string
    username: string
    password: string
    activo: boolean
    needReLogIn?: boolean

    constructor({ id = '', nombre = '', apellido = '', email = '', telefono = '',
        role, username = '', dni = '', password = '', activo = true, needReLogIn = false, }) {
        this.id = id;
        this.userId = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.role = role;
        this.dni = dni;
        this.username = username;
        this.password = password
        this.activo = activo;
        this.needReLogIn = needReLogIn;
    }




}