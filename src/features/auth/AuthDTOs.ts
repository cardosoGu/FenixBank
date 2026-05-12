export interface IUserCreateDTO {
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
