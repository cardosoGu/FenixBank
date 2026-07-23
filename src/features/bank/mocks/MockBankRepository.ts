import { Types } from "mongoose";
import { ITransactionLog, ITransactionReceiver, ITransactionUser, TransactionStatus, TransactionType } from "../../../models/TransactionLogs/ITransactionLog.ts";

// Mock User model
type MockUserDocument = ITransactionLog & {
    _id: Types.ObjectId;
    save: () => Promise<MockUserDocument>;
};

function createMockUser(data: {
    _id: string;
    user: ITransactionUser;
    receiver?: ITransactionReceiver | null;
    value: number;
    status: TransactionStatus;
    type: TransactionType;

}): MockUserDocument {
    const user: MockUserDocument = {
        _id: new Types.ObjectId(data._id),
        user: data.user,
        receiver: data.receiver ?? null,
        value: data.value,
        status: data.status,
        type: data.type,
        save: () => Promise.resolve(user),
    };

    return user;
}

export class MockTransactionLogRepository {
    private transactionLogs: MockUserDocument[] = [
        createMockUser({
            _id: '6a0485b346f293e21cd310d5',
            user: { userId: new Types.ObjectId('507f1f77bcf86cd799439011'), userBalanceAfterTransaction: 100 },
            receiver: { receiverId: new Types.ObjectId('507f1f77bcf86cd799439012'), receiverBalanceAfterTransaction: 200 },
            value: 110,
            status: TransactionStatus.COMPLETED,
            type: TransactionType.TRANSFER,
        }),
        createMockUser({
            _id: '6a0485ac46f293e21cd310c6',
            user: { userId: new Types.ObjectId('507f1f77bcf86cd799439012'), userBalanceAfterTransaction: 100 },
            receiver: { receiverId: new Types.ObjectId('507f1f77bcf86cd799439011'), receiverBalanceAfterTransaction: 200 },
            value: 50,
            status: TransactionStatus.COMPLETED,
            type: TransactionType.DEPOSIT,
        }),
        createMockUser({
            _id: '6a0485b346f293e21cd310eb',
            user: { userId: new Types.ObjectId('507f1f77bcf86cd799439012'), userBalanceAfterTransaction: 100 },
            receiver: { receiverId: new Types.ObjectId('507f1f77bcf86cd799439013'), receiverBalanceAfterTransaction: 200 },
            value: 50,
            status: TransactionStatus.COMPLETED,
            type: TransactionType.TRANSFER,
        })
    ]
    create(data: Omit<ITransactionLog, '_id'>): Promise<ITransactionLog> {
        const newTransactionLog = createMockUser({
            _id: new Types.ObjectId().toString(),
            user: data.user,
            receiver: data.receiver ?? null,
            value: data.value,
            status: data.status,
            type: data.type,
        });
        this.transactionLogs.push(newTransactionLog);
        return Promise.resolve(newTransactionLog);
    }
    createWithSession(data: Omit<ITransactionLog, '_id'>, _options: { session: unknown }): Promise<ITransactionLog> {
        return this.create(data);
    }

    updateById(id: Types.ObjectId, data: Partial<ITransactionLog>): Promise<ITransactionLog | null> {
        const index = this.transactionLogs.findIndex((log) => log._id.toString() === id.toString());
        if (index === -1) return Promise.resolve(null);

        this.transactionLogs[index] = { ...this.transactionLogs[index], ...data };
        return Promise.resolve(this.transactionLogs[index]);
    }

    find(userId: Types.ObjectId): Promise<ITransactionLog[]> {
        const logs = this.transactionLogs.filter((log) =>
            log.user.userId.toString() === userId.toString() ||
            log.receiver?.receiverId.toString() === userId.toString()
        );
        return Promise.resolve(logs);
    }
    findById(id: Types.ObjectId): Promise<ITransactionLog | null> {
        const log = this.transactionLogs.find((log) => log._id.toString() === id.toString());
        return Promise.resolve(log ?? null);
    }

}
