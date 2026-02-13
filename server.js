// ===============================
// RH SYSTEM - LOGIN COMPLETO
// Node.js + Express + JWT + Argon2
// ===============================

import express from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";

dotenv.config();

const app = express();
app.use(express.json());

// ===============================
// CONFIG
// ===============================

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

// ===============================
// MOCK DATABASE (simulando banco)
// senha padrão: 123456
// ===============================

const passwordHash = await argon2.hash("123456");

const users = [
  {
    id: uuid(),
    name: "Admin RH",
    email: "admin@rh.com",
    password_hash: passwordHash,
    role: "RH",
    status: "ACTIVE"
  }
];

// ===============================
// AUTH SERVICE
// ===============================

async function login(email, password) {
  const user = users.find((u) => u.email === email);

  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await argon2.verify(user.password_hash, password);

  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "15m"
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    },
    accessToken: token
  };
}

// ===============================
// AUTH MIDDLEWARE
// ===============================

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ===============================
// ROLE PERMISSION (RBAC)
// ===============================

function permit(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

// ===============================
// ROUTES
// ===============================

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    return res.json(result);
  } catch {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }
});

// ROTA PROTEGIDA
app.get("/employees", authMiddleware, permit("RH", "ADMIN"), (req, res) => {
  res.json({
    message: "Lista de colaboradores",
    loggedUser: req.user
  });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
