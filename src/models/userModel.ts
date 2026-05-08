import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export const accountSchema = new mongoose.Schema({
    pixKeys: [{
        type: String,
        required: true,
        unique: true,
    }],
    balance: {
        type: Number,
        required: true,
        min: [0, 'Balance cannot be negative'],
    }
})
export const sessionSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true,
    },
    refreshTokenExpiresAt: {
        type: Date,
        required: true,
    },
    clientIp: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    }
})

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
    passwordHash: {
        type: String,
        required: true,
    },
    account: { type: accountSchema, required: true },

    sessions: {
        type: [sessionSchema],
        default: [],
        required: false
    },

    transactionLogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransactionLogs',
        required: false,
        default: []
    }]
})

userSchema.methods.passwordMatches = function (passwordHash: string) {
    return bcrypt.compare(passwordHash, this.passwordHash)
}

userSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash')) {
        const salt = await bcrypt.genSalt(10)
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    }
    next()
})

export const User = mongoose.model('User', userSchema)

