import express from "express";
import validate from "../middlewares/validate.middleware.js";
import authtenticateUser from "../middlewares/auth.middleware.js";
import { createProjectSchema, updateProjectSchema, getAllProjectsSchema } from "../validators/project.validations.js";
import { getProjects, getProject, addProject, updateProject ,deleteProject ,getDashboard} from "../controllers/project.controller.js";
import authorizeRole from "../middlewares/role.middleware.js";

const router = express();
//route to get all projects of org


/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: All Projects are fetched successfully
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */

router.get('/', authtenticateUser, validate(getAllProjectsSchema), getProjects) 

// route to get single project of org 


/**
 * @swagger
 * /api/project/{projectId}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project is fetched successfully
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

router.get(
    "/:projectId",
    authtenticateUser,
    getProject
);

/**
 * @swagger
 * /api/project/add:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: TaskFlow Project
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Project management system
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: You are not a member of this organization
 *       500:
 *         description: Internal server error
 */

router.post('/add', authtenticateUser, validate(createProjectSchema), addProject);


/**
 * @swagger
 * /api/project/update/{projectId}:
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Updated Project
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Updated description
 *     responses:
 *       201:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

router.patch('/update/:projectId', authtenticateUser, validate(updateProjectSchema), updateProject);

/**
 * @swagger
 * /api/project/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Only organization admins can delete projects
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

router.delete('/:projectId', authtenticateUser, authorizeRole('org_admin'), deleteProject);

/**
 * @swagger
 * /api/project/{projectId}/dashboard:
 *   get:
 *     summary: Get project dashboard
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project dashboard fetched successfully
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

router.get('/:projectId/dashboard', authtenticateUser, getDashboard);

export default router;