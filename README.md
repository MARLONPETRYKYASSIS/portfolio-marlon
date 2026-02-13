# marlonassis

Sistema de autenticação para RH com:

- Node.js + Express
- JWT para autenticação
- Argon2 para hash de senha
- RBAC por cargo (`RH`, `ADMIN`)

## Como executar

```bash
npm install
cp .env.example .env
npm start
```

Servidor padrão: `http://localhost:3000`

## Endpoints

### `POST /auth/login`

Body:

```json
{
  "email": "admin@rh.com",
  "password": "123456"
}
```

### `GET /employees`

Requer header:

```http
Authorization: Bearer <token>
```
