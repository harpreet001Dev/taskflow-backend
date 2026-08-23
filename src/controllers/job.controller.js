import jobService from "../services/job.service.js";
import ApiError from "../utils/apiError.js";

const getJobStatus = async (req, res) => {
    const { id } = req.params;

    const job = await jobService.getJobStatus(id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    return res.status(200).json({
        success: true,
        data: job,
    });
};

export default {
    getJobStatus,
};