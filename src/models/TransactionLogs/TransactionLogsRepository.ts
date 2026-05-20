import mongoose, { Model } from "mongoose";
import { BaseRepository } from "../../base/BaseRepository.ts";
import { ITransactionLog } from "./ITransactionLog.ts";
import { transactionLogSchema } from "./TransactionLog.ts";

class TransactionLogRepository extends BaseRepository<ITransactionLog> {
    constructor(model: Model<ITransactionLog> = mongoose.model<ITransactionLog>('TransactionLog', transactionLogSchema)) {
        super(model);
    }
    public countTransactions(match: mongoose.FilterQuery<ITransactionLog>): Promise<number> {
        return this.model.countDocuments(match);
    }
}

export { TransactionLogRepository }
