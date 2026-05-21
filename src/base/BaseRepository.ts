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

    find(match: mongoose.FilterQuery<TDocument>, options: mongoose.QueryOptions = {}) {
        return this.model.find(match, null, options)
    }

    create(data: Partial<TDocument>) {
        return this.model.create(data)
    }
    createWithSession(data: Partial<TDocument>, options: mongoose.SaveOptions) {
        return this.model.create([data], options).then(([doc]) => doc)
    }

    update(query: mongoose.FilterQuery<TDocument>, data: UpdateQuery<TDocument>, options: mongoose.QueryOptions = {}) {
        return this.model.findOneAndUpdate(query, data, { new: true, ...options })
    }

    updateById(userId: Types.ObjectId, data: UpdateQuery<TDocument>, options: mongoose.QueryOptions = {}) {
        return this.model.findByIdAndUpdate(userId, data, { new: true, ...options })
    }

    deleteById(id: Types.ObjectId) {
        return this.model.findByIdAndDelete(id)
    }

    exists(match: mongoose.FilterQuery<TDocument>) {
        return this.model.exists(match)
    }
}
