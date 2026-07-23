import { HydratedDocument, Model, Types } from 'mongoose'
import { IBaseInterface } from '../../base/IBaseInterface.ts'

export enum UserRole {
  Customer = 'customer',
  Admin = 'admin',
}

export interface ISession {
  refreshToken: string
  clientIp: string
  userAgent: string
}

export interface IAccount {
  pixKeys: string[]
  balance: number
}

export interface IUser extends IBaseInterface {
  name: string
  email: string
  cpf: string
  role: UserRole
  password: string
  account: IAccount
  sessions: ISession[]
  transactionLogs: Types.ObjectId[]
}

export interface IUserMethods {
  passwordMatches(plainPassword: string): Promise<boolean>;
  readonly isAdmin: boolean;
  readonly hasPixKeys: boolean;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
// deno-lint-ignore ban-types
export type UserModel = Model<IUser, {}, IUserMethods>;
