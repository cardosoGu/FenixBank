import { IBaseResponseDTO } from "../../base/IBaseInterface.ts";
import { ISession } from "../../models/User/IUser.ts";

//================= Base DTO =====================//

export interface UserDTO {
    name: string;
    email: string;
    cpf: string;
    password: string;
    pixKeys: string[];
    balance: number;
}
//================= Inputs DTOs =====================//

export interface LoginInputDTO {
    email: string;
    password: string;
    clientIp: string;
    userAgent: string;
}


//================= Responses DTOs ===================//

export interface AuthResponseDTO extends IBaseResponseDTO {
    user: Omit<UserDTO, 'password'>;
    refreshToken: string;
    accessToken: string;
}

export interface RefreshResponseDTO extends IBaseResponseDTO {
    accessToken: string;
    refreshToken: string;
}

export interface MeResponseDTO extends IBaseResponseDTO {
    user: Omit<UserDTO, 'password'>;
}


export interface SessionsResponseDTO extends IBaseResponseDTO {
    sessions: Omit<ISession[], 'refreshToken'>;
}
