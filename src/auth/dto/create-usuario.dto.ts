import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, MinLength } from "class-validator";
import { UserAuthInterface } from "../interfaces/UserAuth.intercace";
export class CreateUsuarioDto implements UserAuthInterface {

    @IsString()
    @MinLength(3)
    userId: string;

    @IsString()
    @MinLength(3)
    username: string


    @IsString()
    @MinLength(3)
    password: string


    @IsString()
    @MinLength(3)
    @IsOptional()
    email?: string


    @IsBoolean()
    @MinLength(3)
    @IsOptional()
    activo?: boolean

    @IsNumber()
    @IsPositive()
    @IsIn([1, 2, 3, 4, 5, 6, 7])
    role: number


}
