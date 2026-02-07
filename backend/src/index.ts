import "dotenv/config";
import express from "express";
import cors from "cors";
import schedulerRoutes from "./scheduler";
import { setupWorker } from "./worker";
import session from "express-session";
import passport from "passport";
import authRoutes from "./auth";

const app = express();
const PORT = process.env.PORT || 4000;

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(
    session({
        secret: "secret_key",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes);
app.use("/api", schedulerRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

setupWorker();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
