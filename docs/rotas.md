# FenixBank API — Routes

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Cria usuário + conta bancária |
| POST | `/auth/login` | Autentica e retorna tokens |
| GET | `/auth/me` | Retorna usuário autenticado |
| POST | `/auth/refresh` | Renova o access token |
| POST | `/auth/logout` | Encerra sessão atual |
| POST | `/auth/logout-all` | Encerra todas as sessões |

---

## Bank — Operations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/bank/operations/deposit` | Deposita valor na conta |
| POST | `/bank/operations/withdraw` | Saca valor da conta |

---

## Bank — Transference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/bank/transference` | Transfere via pix key |

---

## Bank — Transactions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bank/transactions` | Histórico do usuário autenticado |
| GET | `/bank/transactions/:transactionId` | Detalhe de uma transação |

---

## Bank — Pix Keys

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bank/pix-keys` | Lista chaves do usuário |
| POST | `/bank/pix-keys` | Adiciona nova chave pix |
| DELETE | `/bank/pix-keys/:key` | Remove uma chave pix |

---

## Admin — Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | Lista todos os usuários |
| GET | `/admin/users/:userId` | Detalhe de um usuário |
| PATCH | `/admin/users/:userId` | Atualiza dados do usuário |
| DELETE | `/admin/users/:userId` | Remove usuário |

---

## Admin — Accounts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/accounts` | Lista todas as contas |
| GET | `/admin/accounts/:userId` | Conta de um usuário |
| PATCH | `/admin/accounts/:userId` | Atualiza conta |

---

## Admin — Transactions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/transactions` | Lista todas as transações |
| GET | `/admin/transactions/:transactionId` | Detalhe de qualquer transação |
