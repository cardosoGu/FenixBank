export interface IUserDTO {
    name: string;
    email: string;
    cpf: string;
    password: string;
    pixKeys: string[];
    balance: number;
}

export interface IUserLoginDTO {
    email: string;
    password: string;
}
