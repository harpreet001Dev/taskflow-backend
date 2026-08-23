import express from "express";
import jobController from "../controllers/job.controller.js";
import authtenticateUser from "../middlewares/auth.middleware.js";

const router=express();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Background job status APIs
 */

/**
 * @swagger
 * /api/job/{id}:
 *   get:
 *     summary: Get job status
 *     description: Get the current status and metadata of a background email job.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Background job ID
 *         example: "6"
 *     responses:
 *       200:
 *         description: Job status fetched successfully
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

router.get("/:id",authtenticateUser ,jobController.getJobStatus);

export default router;