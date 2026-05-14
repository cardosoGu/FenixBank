import { MockAuthRepository } from '../../auth/mocks/MockAuthRepository.ts';
import { UserRepository } from '../../../models/User/UserRepository.ts';
import { MockTransactionLogRepository } from "./MockBankRepository.ts";
import { TransactionLogRepository } from "../../../models/TransactionLogs/TransactionLogsRepository.ts";
import { Types } from "mongoose";
import { TransactionStatus, TransactionType } from "../../../models/TransactionLogs/ITransactionLog.ts";
import throwlhos from "throwlhos";
import { BankService } from "../BankServices.ts";


const mockAuthRepository = new MockAuthRepository();
const mockTransactionLogRepository = new MockTransactionLogRepository();

export class MockBankService extends BankService {
    constructor() {
        super(mockAuthRepository as unknown as UserRepository, mockTransactionLogRepository as unknown as TransactionLogRepository);
    }

    override async transfer(userId: string, pixKey: string, amount: number): Promise<any>{
        const user = await mockAuthRepository.findById(new Types.ObjectId(userId));
        if (!user) throw throwlhos.default.err_notFound("User not found!");

        const receiver = await mockAuthRepository.findByPixKey(pixKey);
        if (!receiver) throw throwlhos.default.err_notFound("Receiver not found!");

        if (receiver._id.toString() === userId)
            throw throwlhos.default.err_badRequest("You can't transfer to yourself!");

        if (user.account.balance < amount)
            throw throwlhos.default.err_badRequest("Insufficient account balance!");

        const transactionLog = await mockTransactionLogRepository.create({
            user: { userId: new Types.ObjectId(userId), userBalanceAfterTransaction: user.account.balance - amount },
            receiver: { receiverId: new Types.ObjectId(receiver._id), receiverBalanceAfterTransaction: receiver.account.balance + amount },
            type: TransactionType.TRANSFER,
            status: TransactionStatus.COMPLETED,
            value: amount,
        });

        return { success: true, transactionLog };
    }
}
