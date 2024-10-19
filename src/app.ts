import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/user";
import walletRoutes from "./routes/wallet";
import paymentRoutes from "./routes/payment";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/wallets", walletRoutes);
app.use("/payments", paymentRoutes);

app.get("/test", (_req: Request, res: Response) => {
  return res.sendStatus(200);
});

app.use("*", (req: Request, res: Response) => {
  const path = req.originalUrl;
  const method = req.method;
  return res.status(404).json({
    error: true,
    path,
    method,
    message: `The method ${method} is not defined on path ${path}`,
  });
});

export default app;
