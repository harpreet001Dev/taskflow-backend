import express from "express";

import memberController from "../controllers/member.controller.js";
import authenticateUser from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Organization member management APIs
 */

/**
 * @swagger
 * /api/member/add:
 *   post:
 *     summary: Add a member to the organization
 *     description: Add an existing registered user to the authenticated user's organization. Only organization admins can add members.
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the registered user to add
 *     responses:
 *       201:
 *         description: Member added successfully
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Only organization admins can add members
 *       404:
 *         description: User not found
 *       409:
 *         description: User is already a member of this organization
 *       500:
 *         description: Internal server error
 */
router.post(
    "/add",
    authenticateUser,
    authorizeRole("org_admin"),
    memberController.addMember
);

export default router;