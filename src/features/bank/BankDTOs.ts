import { Types } from "mongoose";
import {
    TransactionStatus,
    TransactionType,
} from "../../models/TransactionLogs/ITransactionLog.ts";
import { IBaseResponseDTO } from "../../base/IBaseInterface.ts";

// =========================== Base DTO ===========================

export interface TransactionLogDTO {
    transactionId: Types.ObjectId;
    user: {
        userId: Types.ObjectId;
        userBalanceAfterTransaction: number;
    };
    receiver?: {
        receiverId: Types.ObjectId;
        receiverBalanceAfterTransaction: number;
    };
    type: TransactionType;
    status: TransactionStatus;
    value: number;
}



// =========================== Response DTOs ===========================
export interface BankResponseDTO extends IBaseResponseDTO {
    transactionLog: TransactionLogDTO;
}

export interface GetTransactionsResponseDTO extends IBaseResponseDTO {
    transactions: TransactionLogDTO[];
    pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalTransactions: number;
    };
}

export interface GetAccountInfoResponseDTO extends IBaseResponseDTO {
    balance: number;
    pixKeys: string[];
}
