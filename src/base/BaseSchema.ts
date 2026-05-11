import mongoose from "mongoose";

export class BaseSchema {
    schema: mongoose.Schema

    constructor(definition: mongoose.SchemaDefinition) {
        this.schema = new mongoose.Schema(definition, {timestamps: true})
    }

}
