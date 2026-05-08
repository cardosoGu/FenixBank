import { TransactionLogs } from "../models/transactionLogsModel.ts";
import { transactionLogsTypes } from "../types/transactionLogsTypes.ts";

class TransactionLogsRepositoryClass {
    constructor(private transactionLogsModel: typeof TransactionLogs) {}

    create(data: transactionLogsTypes) {
        return this.transactionLogsModel.create(data);
    }

    findById(id: string) {
        return this.transactionLogsModel.findById(id);
    }

    findByUserId(userId: string) {
        return this.transactionLogsModel.find({ "user.userId": userId });
    }

    findByStatus(status: string) {
        return this.transactionLogsModel.find({ status });
    }

    findByType(type: string) {
        return this.transactionLogsModel.find({ type });
    }

    findByDateRange(startDate: Date, endDate: Date) {
        return this.transactionLogsModel.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });
    }

    updateStatus(id: string, status: string) {
        return this.transactionLogsModel.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );
    }

    deleteById(id: string) {
        return this.transactionLogsModel.findByIdAndDelete(id);
    }
}

export const TransactionLogsRepository = new TransactionLogsRepositoryClass(TransactionLogs);
