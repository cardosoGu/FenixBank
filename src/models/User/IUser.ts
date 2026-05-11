import { Types } from 'mongoose'
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
  passwordHash: string
  account: IAccount
  sessions: ISession[]
  transactionLogs: Types.ObjectId[]
}
