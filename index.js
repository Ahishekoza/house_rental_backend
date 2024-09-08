import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/index.js";
import { userRoute } from "./src/routes/user.routes.js";
import { propertyRoute } from "./src/routes/property.routes.js";
import { rentalRoute } from "./src/routes/rental.routes.js";
import { paymentRoute } from "./src/routes/payment.routes.js";
import { webhook } from "./src/controllers/payment.controller.js";

dotenv.config({ path: ".env" });
const PORT = process.env.PORT || 3000;

// --External Configuration
app.use(cors());

app.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

// --Routes--
app.use(express.json());
app.use("/api/v1", userRoute, propertyRoute, rentalRoute,paymentRoute);

// ---Server initialization after DB is connected --
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message());
  });
