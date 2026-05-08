import { accountSchema, sessionSchema, userSchema, } from "../models/userModel.ts";
import { InferSchemaType } from "mongoose";

export type typeUserSchema = InferSchemaType<typeof userSchema>;
export type typeUserAccountSchema = InferSchemaType<typeof accountSchema>;
export type typeUserSessionSchema = InferSchemaType<typeof sessionSchema>;
