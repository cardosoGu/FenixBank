import mongoose, { Model, Types, UpdateQuery } from 'mongoose'
import { IBaseInterface } from './IBaseInterface.ts'

export class BaseRepository<TDocument extends IBaseInterface, TMethods = {}> {
    protected model: Model<TDocument, {}, TMethods>;

    constructor(model: Model<TDocument, {}, TMethods>) {
        this.model = model;
    }
    findById(id: Types.ObjectId) {
        return this.model.findById(id)
    }

    findOne(match: mongoose.FilterQuery<TDocument>) {
        return this.model.findOne(match)
    }

    find(match: mongoose.FilterQuery<TDocument>) {
        return this.model.find(match)
    }

    create(data: Partial<TDocument>) {
        return this.model.create(data)
    }

    updateById(id: Types.ObjectId, data: UpdateQuery<TDocument>) {
        return this.model.findByIdAndUpdate(id, data, { new: true })
    }

    deleteById(id: Types.ObjectId) {
        return this.model.findByIdAndDelete(id)
    }

    exists(match: mongoose.FilterQuery<TDocument>) {
        return this.model.exists(match)
    }
}
