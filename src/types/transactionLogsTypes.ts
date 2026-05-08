import { transactionLogsSchema } from "../models/transactionLogsModel.ts";
import { InferSchemaType } from "mongoose";

export type transactionLogsTypes = InferSchemaType<typeof transactionLogsSchema>;
