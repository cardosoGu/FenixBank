// deno-lint-ignore no-import-prefix
import { assert, assertExists } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { MockResponser } from "../../utils/Stubs.ts";
import { BankController } from "./BankControllers.ts";
import { BankRules } from "./BankRules.ts";
import { MockBankService } from "./mocks/MockBankService.ts";
import { Request } from "express";

function controllerMock() {
    const bankRules = new BankRules()
    const bankService = new MockBankService()
    const bankController = new BankController(bankService, bankRules)

    return bankController
}

Deno.test({
    name: 'withdraw - Should process withdraw successfully and return transaction log',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()
        const request = {
            body: {
                amount: 20
            },
            user: {
                userId: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request

        await bankController.withdraw(request, res)
        assert(res.called.send_ok, "should have called send_ok");
        assertExists(res.payload.data.transactionLog, "should have returned transaction log");
    }
})
Deno.test({
    name: 'withdraw - Should process withdraw fail when user has insufficient funds',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            body: {
                amount: 100
            },
            user: {
                userId: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request

        await bankController.withdraw(request, res)

        assert(res.called.send_badRequest, "Insufficient account balance!");
        assertExists(res.payload.errors, "should have returned transaction log");
    }
})
Deno.test({
    name: 'deposit - Should process deposit successfully and return transaction log',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            body: {
                amount: 100
            },
            user: {
                userId: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request

        await bankController.deposit(request, res)

        assert(res.called.send_ok, "Deposit successful!");
        assertExists(res.payload.data.transactionLog, "should have returned transaction log");
    }
})
Deno.test({
    name: 'deposit - Should fail when deposit amount is invalid',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            body: {
                amount: 100000
            },
            user: {
                userId: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request

        await bankController.deposit(request, res)

        assert(res.called.send_badRequest, "Amount must be a valid number");
        assertExists(res.payload.errors, "should have returned errors");
    }
})

Deno.test({
    name: 'deposit - Should fail when user is not found',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            body: {
                amount: 100000
            },
            user: {
                userId: "000000000000000000000000"
            }
        } as unknown as Request

        await bankController.deposit(request, res)

        assert(res.called.send_badRequest, "User not found!");
        assertExists(res.payload.errors, "should have returned errors");
    }
})
Deno.test({
    name: 'getAccountInfo - Should return account info successfully',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request

        await bankController.getAccountInfo(request, res)

        assert(res.called.send_ok, "Account info returned successfully!");
        assertExists(res.payload.data.accountInfo, "should have returned account info");
    }
})
Deno.test({
    name: 'getAccountInfo - Should return fail when user is not found',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "000000000000000000000000"
            }
        } as unknown as Request

        await bankController.getAccountInfo(request, res)
        assert(res.called.send_notFound, "User not found!");
    }
})

Deno.test({
    name: 'getTransactionHistory - Should return sucessfully transaction history',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            }
        } as unknown as Request

        await bankController.getTransactions(request, res)
        assert(res.called.send_ok, "Transaction history returned successfully!");
    }
})
Deno.test({
    name: 'getTransactionHistory - Should return fail when user is not found',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "000000000000000000000000"
            }
        } as unknown as Request

        await bankController.getTransactions(request, res)
        assert(res.called.send_notFound, "User not found!");
    }
})
Deno.test({
    name: 'getTransactionById - Should return sucessfully transaction data',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            },
            params: {
                id: '6a0485ac46f293e21cd310c6'
            }

        } as unknown as Request

        await bankController.getTransactionById(request, res)
        assert(res.called.send_ok, "Transaction data returned successfully!");
        assertExists(res.payload.data.transactionLog, "should have returned transaction data");
    }
})
Deno.test({
    name: 'getTransactionById - Should return fail with no permission to access transaction data',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            },
            params: {
                id: '6a0485b346f293e21cd310eb'
            }

        } as unknown as Request

        await bankController.getTransactionById(request, res)
        assert(res.called.send_forbidden, "You don't have permission to access this transaction log");
    }
})
Deno.test({
    name: 'getTransactionById - Should return fail when user is not found',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "000000000000000000000000"
            },
            params: {
                id: '6a0485b346f293e21cd310eb'
            }

        } as unknown as Request

        await bankController.getTransactionById(request, res)
        assert(res.called.send_notFound, "User not found!");
    }
})
Deno.test({
    name: 'addPixKey - Should add pix key successfully',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            },
            body: {
                newPixKey: "11987654321"
            }

        } as unknown as Request

        await bankController.addPixKey(request, res)
        assert(res.called.send_ok, "Pix key added successfully!");
    }
})
Deno.test({
    name: 'addPixKey - should fail when pix key is already registered in user account',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            },
            body: {
                newPixKey: "maria.santos@example.com"
            }

        } as Request

        await bankController.addPixKey(request, res)
        assert(res.called.send_badRequest, "Pix key is already registered in your account!");
    }
})
Deno.test({
    name: 'removePixKey - should delete pix key successfully',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439012"
            },
            params: {
                key: "maria.santos@example.com"
            }

        } as unknown as Request

        await bankController.removePixKey(request, res)

        assert(res.called.send_ok, "Pix key deleted successfully!");
    }
})
Deno.test({
    name: 'removePixKey - should return fail when pix key is not found in user account',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439012"
            },
            params: {
                key: "mockPixKey"
            }

        } as unknown as Request

        await bankController.removePixKey(request, res)

        assert(res.called.send_badRequest, "Pix key not found in your account!");
    }
})

Deno.test({
    name: 'transfer - Should process transfer successfully and return transaction log',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439013"
            },
            body:{
                pixKey: "joao.silva@example.com",
                amount: 20
            }

        } as Request

        await bankController.transfer(request, res)
        assert(res.called.send_ok, "Transfer processed successfully!");
    }
})
Deno.test({
    name: 'transfer - Should return error when pix key is not found in user account',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439012"
            },
            body:{
                pixKey: "invalid_pix_key",
                amount: 20
            }

        } as Request

        await bankController.transfer(request, res)
        assert(res.called.send_notFound, "Pix key not found in your account!");
    }
})
Deno.test({
    name: 'transfer - Should process transfer fail you cant transfer to your own pix key',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            },
            body:{
                pixKey: "joao.silva@example.com",
                amount: 20
            }

        } as Request

        await bankController.transfer(request, res)
        assert(res.called.send_badRequest, "You can't transfer to yourself!");
    }
})
Deno.test({
    name: 'transfer - Should process transfer fail you dont have balance to transfer',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const bankController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: "507f1f77bcf86cd799439011"
            },
            body:{
                pixKey: "joao.silva@example.com",
                amount: 50
            }

        } as Request

        await bankController.transfer(request, res)
        assert(res.called.send_badRequest, "Insufficient account balance!");
    }
})
