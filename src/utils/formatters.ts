import { UserDTO } from "../features/auth/AuthDTOs.ts";
import { TransactionLogDTO } from "../features/bank/BankDTOs.ts";
import { ITransactionLog } from "../models/TransactionLogs/ITransactionLog.ts";
import { IUser } from "../models/User/IUser.ts";

export function formatTransaction(transaction: ITransactionLog): TransactionLogDTO {
    return {
        transactionId: transaction._id!,
        user: {
            userId: transaction.user.userId,
            userBalanceAfterTransaction: transaction.user.userBalanceAfterTransaction
        },
        receiver: transaction.receiver ? {
            receiverId: transaction.receiver.receiverId,
            receiverBalanceAfterTransaction: transaction.receiver.receiverBalanceAfterTransaction
        } : undefined,
        type: transaction.type,
        value: transaction.value,
        status: transaction.status,
    };
}
export function userFormat(user: IUser): Omit<UserDTO, 'password'> {
    return {
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        pixKeys: user.account.pixKeys,
        balance: user.account.balance,
    }
}
