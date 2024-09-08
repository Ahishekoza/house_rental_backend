import express from "express";
import { checkOutSession, webhook } from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const paymentRoute = express.Router();

paymentRoute.post("/create-checkout-session", verifyToken, checkOutSession);

export { paymentRoute };
