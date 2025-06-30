import { ForbiddenException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { AxiosResponse } from "axios";

const fs = require('fs').promises;
var jwt = require('jsonwebtoken');



export function  handlerError(err: any) {
  console.log(err)
}



export function  handlerHttpError(err: AxiosResponse) {
  switch( err.status ){
    case 404: 
    throw new RpcException({message: err.statusText, status: 404});
    break
    case 401: 
    throw new RpcException({message: err.statusText, status: 401});
    break;
    case 403: 
    throw new RpcException({message: err.statusText, status: 403});
    default: 
    throw new RpcException(`Estado ${err.status} - ${err.statusText}`)
  }
  
}



export function addDays(date: string, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getFullDate(dia = new Date()): string {
  return (
    dia.getFullYear() + '-' + (dia.getMonth() + 1) + '-' + dia.getUTCDate()
  );
}

export function getDataFromJSON(array) {
  const arrayResult = Object.keys(array).map(item => {
    return {
      id: item,
      attributes: array[item]
    }
  });
  return arrayResult;
}


export async function leerArchivo(path) {
  try {

    let data = await fs.readFile(`${path}`);
    return data;
  } catch (err) {
    console.log(`Error al leer el archivo ${path}`)
    console.log(err)
    return false;
  }
}

export async function generarJWT(id, expires = 6) {
  return new Promise((resolve, reject) => {

    jwt.sign({ id: id }, process.env.SIGN, {
      expiresIn: `${expires}h`
    }, (error, token) => {

      if (error) {
        console.log('Imposible generar JWT ');
        console.error(error);
        reject(false);

      } else {
        resolve(token)
      }
    });
  })
}

export async function encriptarPassword (password) {
  const bcrypt = require('bcrypt');
  try {
    const saltRounds = 10; // cuanto mayor el número, más seguro (y más lento)
    const hash = await bcrypt .hash(password, saltRounds);
    return hash;
  } catch (err) {
    throw new Error('Error al encriptar la contraseña');
  }
};
