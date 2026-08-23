import emailQueue from "./email.queue.js";

const job = await emailQueue.add("test-email", {
    message: "Hello from TaskFlow",
},
    {
        attempts: 4, // max 4 attemts 
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    },
    
);

console.log("Job added:", job.id);

process.exit(0);