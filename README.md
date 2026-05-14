# 🏦 FenixBank API

REST API for the **FenixBank** digital banking platform.

### Features

- JWT authentication
- Multi-session support
- Bank account management
- Deposits, withdrawals, and Pix transfers
- Pix key management
- Transaction history

---

# ⚙️ Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Database | MongoDB |
| ORM | Mongoose |
| Security | JWT + Bcrypt |
| Tests | Deno.test |

### Libraries

| Library | Purpose |
|---|---|
| `responser` | Standardized HTTP responses |
| `request-check` | Request validation |
| `morgan` | HTTP request logging |
| `throwlhos` | HTTP error handling |
| `swagger-ui-express` | Swagger documentation UI |

---

# 🧠 How run with Deno

1. Clone the repository
```
git clone https://github.com/cardosoGu/FenixBank.git
```
2. Install dependencies:
```
deno install
```
3. Run tests
```
deno run coverage
```
4. Start Server
```
deno run dev
```

# 🔐 Authentication

### Protected routes require:

```http
Authorization: Bearer <accessToken>
```

### Refresh token

- Stored in **HttpOnly Cookie**
- Used to generate new access tokens

---

## Login

### `POST /api/auth/login`

```json
{
  "email": "maria@fenixbank.com",
  "password": "StrongPass123"
}
```

---

## Register

### `POST /api/auth/register`

```json
{
  "name": "Maria Silva",
  "email": "maria@fenixbank.com",
  "cpf": "181.990.300-11",
  "password": "StrongPass123",
  "pixKeys": [
    "maria@fenixbank.com"
  ],
  "balance": 250
}
```

---

## Refresh Session

### `PUT /api/auth/refresh`

- Requires valid refresh token cookie
- Returns new access token
- Updates refresh token session/cookie

---

## Token Strategy

| Token | Description |
|---|---|
| Access Token | Short-lived token used for API requests |
| Refresh Token | Long-lived token stored in HttpOnly cookie |

---

## Session System

- Multiple sessions allowed
- Different devices/browsers supported
- Logout current session or all sessions

---

# 📌 Endpoints

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Create user and bank account |
| `POST` | `/api/auth/login` | ❌ | Authenticate user |
| `GET` | `/api/auth/me` | ✅ | Get authenticated user |
| `PUT` | `/api/auth/refresh` | ✅ | Refresh current session |
| `POST` | `/api/auth/logout` | ✅ | Logout current session |
| `POST` | `/api/auth/logoutAll` | ✅ | Logout all sessions |
| `GET` | `/api/auth/sessions` | ✅ | List active sessions |

---

## Bank

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bank/account` | ✅ | Get account data |
| `POST` | `/api/bank/deposit` | ✅ | Deposit money |
| `POST` | `/api/bank/withdraw` | ✅ | Withdraw money |
| `POST` | `/api/bank/transfer` | ✅ | Transfer via Pix key |
| `GET` | `/api/bank/transactions` | ✅ | Get transaction history |
| `GET` | `/api/bank/transactions/:transactionId` | ✅ | Get transaction details |
| `POST` | `/api/bank/pixKey` | ✅ | Add Pix key |
| `DELETE` | `/api/bank/pixKey/:key` | ✅ | Remove Pix key |

---
