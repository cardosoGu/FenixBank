# FenixBank API — Routes

## Auth

| Method |   Path  | Authenticado | Description |
|--------|---------|--------------|-------------|
| POST | `api/auth/register`   |❌| Cria usuário + conta bancária seta refreshToken e retorna accessToken |
| POST | `api/auth/login`      |❌| Autentica usuario, seta refreshToken e retorna accessToken |
| GET  | `api/auth/me`         |✅| Retorna dados do usuario autenticado |
| POST | `api/auth/refresh`    |✅| Atualiza a sessão atual, seta novo refreshToken e retorna novo accessToken |
| POST | `api/auth/logout`     |✅| limpa cookies, e encerra sessão atual |
| POST | `api/auth/logout-all` |✅| Encerra todas as sessões ativas do usuario |
| GET  | `api/auth/sessions`   |✅| Busca todas as sessões ativas do usuario |
---

## Bank — Operations

| Method | Path | Description |
|--------|------|-------------|
| POST | `api/bank/operations/deposit` | Deposita valor na conta |
| POST | `api/bank/operations/withdraw` | Saca valor da conta |

---

## Bank — Transference

| Method | Path | Description |
|--------|------|-------------|
| POST | `api/bank/transference` | Transfere via pix key |

---

## Bank — Transactions

| Method | Path | Description |
|--------|------|-------------|
| GET | `api/bank/transactions` | Histórico do usuário autenticado |
| GET | `api/bank/transactions/:transactionId` | Detalhe de uma transação |

---

## Bank — Pix Keys

| Method | Path | Description |
|--------|------|-------------|
| GET | `api/bank/pix-keys` | Lista chaves do usuário |
| POST | `api/bank/pix-keys` | Adiciona nova chave pix |
| DELETE | `api/bank/pix-keys/:key` | Remove uma chave pix |

---
