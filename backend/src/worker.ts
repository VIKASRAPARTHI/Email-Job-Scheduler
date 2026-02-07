import { Worker, Job } from "bullmq";
import { redisConnection } from "./config/queue";
import { prisma } from "./lib/prisma";
import nodemailer from "nodemailer";

const createTransporter = async () => {

    if (!process.env.ETHEREAL_USER) {
        const testAccount = await nodemailer.createTestAccount();
        console.log("Ethereal Test Account:", testAccount);
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    return nodemailer.createTransport({
        host: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASS,
        },
    });
};

export const setupWorker = () => {
    const worker = new Worker(
        "email-queue",
        async (job: Job) => {
            console.log(`Processing job ${job.id} for ${job.data.recipient}`);

            const transporter = await createTransporter();



            try {
                await new Promise(resolve => setTimeout(resolve, 2000));

                const info = await transporter.sendMail({
                    from: '"Scheduler App" <scheduler@example.com>',
                    to: job.data.recipient,
                    subject: job.data.subject,
                    text: job.data.body,
                    html: `<p>${job.data.body}</p>`,
                    attachments: job.data.attachments,
                });

                console.log(`[Job ${job.id}] Sent to ${job.data.recipient} | MsgId: ${info.messageId}`);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

                if (job.data.dbId) {
                    await prisma.scheduledEmail.update({ where: { id: job.data.dbId }, data: { status: 'SENT' } });
                }

            } catch (error) {
                console.error(`[Job ${job.id}] Failed:`, error);
                if (job.data.dbId) {
                    await prisma.scheduledEmail.update({ where: { id: job.data.dbId }, data: { status: 'FAILED' } });
                }
                throw error;
            }
        },
        {
            connection: redisConnection,
            concurrency: parseInt(process.env.WORKER_CONCURRENCY || "1"),
            limiter: {
                max: parseInt(process.env.MAX_EMAILS_PER_HOUR || "50"),
                duration: 3600000, // 1 hour
            }
        }
    );

    worker.on("completed", (job: Job) => {
        console.log(`Job ${job.id} completed!`);
    });

    worker.on("failed", (job: Job | undefined, err: Error) => {
        console.log(`Job ${job?.id} failed with ${err.message}`);
    });

    return worker;
};
