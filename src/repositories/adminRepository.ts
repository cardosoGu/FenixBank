import { User } from "../models/userModel.ts";
import { TransactionLogs } from "../models/transactionLogsModel.ts";

class AdminRepositoryClass {
    constructor(
        private userModel: typeof User,
        private transactionLogsModel: typeof TransactionLogs
    ) {}

    // ──── Users ────

    findAllUsers(page: number = 1, limit: number = 20) {
        return this.userModel
            .find()
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-passwordHash -sessions");
    }

    countUsers() {
        return this.userModel.countDocuments();
    }

    findUsersByRole(role: string) {
        return this.userModel
            .find({ role })
            .select("-passwordHash -sessions");
    }

    updateUserRole(userId: string, role: string) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );
    }

    deleteUser(userId: string) {
        return this.userModel.findByIdAndDelete(userId);
    }

    // ──── Transactions ────

    findAllTransactions(page: number = 1, limit: number = 20) {
        return this.transactionLogsModel
            .find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
    }

    countTransactions() {
        return this.transactionLogsModel.countDocuments();
    }

    findTransactionsByStatus(status: string) {
        return this.transactionLogsModel.find({ status });
    }

    // ──── Métricas ────

    getTotalBalance() {
        return this.userModel.aggregate([
            { $group: { _id: null, total: { $sum: "$account.balance" } } }
        ]);
    }
    getUserBalance(userId: string) {
        return this.userModel.findById(userId).select("account.balance");
    }
}

export const AdminRepository = new AdminRepositoryClass(User, TransactionLogs);
