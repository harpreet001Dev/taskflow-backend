import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import deadLetterQueue from "../queues/deadLetter.queue.js";

const emailWorker = new Worker(
    "email",
    async (job) => {
        const {
            taskId,
            taskTitle,
            userName,
            userEmail,
        } = job.data;

        console.log("\n📧 TASK ASSIGNMENT EMAIL");
        console.log("--------------------------------");
        console.log(`To      : ${userEmail}`);
        console.log(`Name    : ${userName}`);
        console.log(`Subject : You have been assigned a task`);
        console.log(`Task    : ${taskTitle}`);
        console.log("--------------------------------\n");
        return {
            success: true,
            recipient: userEmail,
            taskId,
        };
    },
    {
        connection: redisConnection,
    }
);

emailWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

emailWorker.on("failed", async (job, error) => {
    console.error(
        `❌ [${new Date().toLocaleTimeString()}] Job ${job?.id} failed:`,
        error.message
    );
    // console.log("attemptsMade:", job.attemptsMade);
    // console.log("maxAttempts:", job.opts.attempts);
    if (job && job.attemptsMade >= job.opts.attempts) {
        await deadLetterQueue.add("failed-email", {
            originalJobId: job.id,
            data: job.data,
            error: error.message,
        });

        console.log(`☠️ Job ${job.id} moved to dead-letter queue`);
    }
});