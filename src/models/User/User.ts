import { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import { ISession, IAccount, IUser, UserRole } from "./IUser.ts";
import { BaseSchema } from "../../base/BaseSchema.ts";

const sessionSchema = new Schema<ISession>({
    refreshToken: { type: String, required: true, default: null },
    clientIp: { type: String, required: true, default: null },
    userAgent: { type: String, required: true, default: null },
})

const accountSchema = new Schema<IAccount>({
    pixKeys: { type: [String], default: [] },
    balance: { type: Number, required: true, min: [0, 'Balance cannot be negative'], default: 0 },
})

// Schema Class
class UserSchemaClass extends BaseSchema {
    constructor() {
        super({
            name: { type: String, required: true, default: null },
            email: { type: String, required: true, unique: true },
            cpf: { type: String, required: true, unique: true },
            role: { type: String, enum: Object.values(UserRole), default: UserRole.Customer },
            passwordHash: { type: String, required: true, default: null },
            account: { type: accountSchema, required: true },
            sessions: { type: [sessionSchema], default: [] },
            transactionLogs: [{ type: Schema.Types.ObjectId, ref: 'TransactionLog', default: [] }],
        })
    }
}

// Class to add methods and manipulate data before saving to database
class UserClass implements IUser {
    name!: IUser['name']
    email!: IUser['email']
    cpf!: IUser['cpf']
    role!: IUser['role']
    passwordHash!: IUser['passwordHash']
    account!: IUser['account']
    sessions!: IUser['sessions']
    transactionLogs!: IUser['transactionLogs']

    constructor(data: IUser) {
        this.name = data.name
        this.email = data.email
        this.cpf = data.cpf
        this.role = data.role
        this.passwordHash = data.passwordHash
        this.account = data.account
        this.sessions = data.sessions
        this.transactionLogs = data.transactionLogs

    }
    get isAdmin(): boolean {
        return this.role === UserRole.Admin
    }

    get hasPixKeys(): boolean {
        return this.account.pixKeys.length > 0
    }

    async passwordMatches(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.passwordHash)
    }

}

// When intance, the BaseSchema will automatic create the mongoose.Schema
const UserSchema = new UserSchemaClass().schema
//load class will add getters and setters and UserClass mathods and properties
UserSchema.loadClass(UserClass)


UserSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash')) {
        const salt = await bcrypt.genSalt(10)
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    }
    next()
})



export { UserSchema }
