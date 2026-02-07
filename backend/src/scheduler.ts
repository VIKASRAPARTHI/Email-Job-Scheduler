import { Router } from "express";
import { emailQueue } from "./config/queue";
import { prisma } from "./lib/prisma";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const router = Router();

router.post("/schedule", upload.array('attachments'), async (req, res) => {
    try {
        const { recipient, subject, body, delay } = req.body;
        const files = req.files as Express.Multer.File[];
        console.log("Schedule Request:", { recipient, subject, delay });

        if (!recipient || !subject || !body) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const attachments = files ? files.map(file => ({
            filename: file.originalname,
            path: file.path,
        })) : [];

        const scheduledTime = new Date(Date.now() + (Number(delay) || 0));
        const delayMs = Number(delay) || 0;

        console.log("Creating DB entry...");
        const emailJob = await prisma.scheduledEmail.create({
            data: {
                recipient,
                subject,
                body,
                scheduledTime,
                status: "PENDING",
                attachments: attachments as Prisma.InputJsonValue,
            },
        });

        console.log("Adding to BullMQ...", { delayMs });
        const job = await emailQueue.add(
            "send-email",
            {
                recipient,
                subject,
                body,
                dbId: emailJob.id,
                attachments: attachments,
            },
            {
                delay: delayMs,
                jobId: emailJob.id,
            }
        );
        console.log("Job added successfully");

        await prisma.scheduledEmail.update({
            where: { id: emailJob.id },
            data: { jobId: job.id },
        });

        res.json({ message: "Email scheduled", jobId: job.id, dbId: emailJob.id });
    } catch (error) {
        console.error("Error scheduling email:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/emails", async (req, res) => {
    try {
        const emails = await prisma.scheduledEmail.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(emails);
    } catch (error) {
        console.error("Error fetching emails:", error);
        res.status(500).json({ error: "Failed to fetch emails" });
    }
});

export default router;
