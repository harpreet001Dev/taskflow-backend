import emailQueue from "../queues/email.queue.js";

const getJobStatus = async (jobId) => {
    const job = await emailQueue.getJob(jobId);

    if (!job) {
        return null;
    }

    const state = await job.getState();

    let status;

    switch (state) {
        case "waiting":
        case "delayed":
            status = "pending";
            break;

        case "active":
            status = "active";
            break;

        case "completed":
            status = "completed";
            break;

        case "failed":
            status = "failed";
            break;

        default:
            status = state;
    }

    return {
        jobId: job.id,
        status,
        metadata: job.data,
    };
};

export default {getJobStatus};