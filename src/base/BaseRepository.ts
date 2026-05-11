import mongoose, { Model, Types, UpdateQuery } from 'mongoose'
import { IBaseInterface } from './IBaseInterface.ts'

export class BaseRepository<T extends IBaseInterface> {
    protected model: Model<T>

    constructor(model: Model<T>) {
        this.model = model
    }

    findById(id: Types.ObjectId) {
        return this.model.findById(id)
    }

    findOne(match: mongoose.FilterQuery<T>) {
        return this.model.findOne(match)
    }

    find(match: mongoose.FilterQuery<T>) {
        return this.model.find(match)
    }

    create(data: Partial<T>) {
        return this.model.create(data)
    }

    updateById(id: Types.ObjectId, data: UpdateQuery<T>) {
        return this.model.findByIdAndUpdate(id, data, { new: true })
    }

    deleteById(id: Types.ObjectId) {
        return this.model.findByIdAndDelete(id)
    }

    exists(match: mongoose.FilterQuery<T>) {
        return this.model.exists(match)
    }
}
