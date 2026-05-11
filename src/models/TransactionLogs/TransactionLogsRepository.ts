import mongoose, { Model } from "mongoose";
import { BaseRepository } from "../../base/BaseRepository.ts";
import { ITransactionLog } from "./ITransactionLog.ts";
import { transactionLogSchema } from "./TransactionLog.ts";

class TransactionLogRepository extends BaseRepository<ITransactionLog> {
    constructor(model: Model<ITransactionLog> = mongoose.model<ITransactionLog>('TransactionLog', transactionLogSchema)) {
        super(model);
    }
}

export { TransactionLogRepository }
