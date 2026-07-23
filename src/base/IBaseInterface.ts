import { Types } from 'mongoose'

export interface IBaseInterface {
    _id?: Types.ObjectId
    createdAt?: Date
    updatedAt?: Date
}
export interface IBaseResponseDTO {
    success: boolean;
    message: string;
}

export interface IBaseService {
    insuccess: boolean;
    message: string;
}