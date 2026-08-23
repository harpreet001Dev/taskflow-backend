import express from "express";
import validate from "../middlewares/validate.middleware.js";
import authtenticateUser from "../middlewares/auth.middleware.js";
import taskController from "../controllers/task.controller.js";
import {
    getAllTaskSchema,
    createTaskSchema,
    updateTaskSchema,
    assignTaskSchema,
    bulkUpdateTaskStatusSchema,
    addCommentSchema,
} from "../validators/task.validations.js";

const router = express();
/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/task:
 *   get:
 *     summary: Get all tasks
 *     description: Get all tasks belonging to the authenticated user's organization with pagination, filters, and search.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of tasks per page
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, review, done]
 *         description: Filter tasks by status
 *
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter tasks by priority
 *
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: integer
 *         description: Filter tasks by assigned user ID
 *
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks from this due date
 *
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter tasks up to this due date
 *
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search tasks by title or description
 *
 *     responses:
 *       200:
 *         description: All tasks are fetched successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */


router.get('/', authtenticateUser, validate(getAllTaskSchema), taskController.getTasks)

/**
 * @swagger
 * /api/task/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     description: Get a single task belonging to the authenticated user's organization.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task is fetched successfully
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:taskId', authtenticateUser, taskController.getTaskById)

/**
 * @swagger
 * /api/task/add:
 *   post:
 *     summary: Add a task
 *     description: Create a new task in a project belonging to the authenticated user's organization.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *             properties:
 *               projectId:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: Implement task API
 *               description:
 *                 type: string
 *                 example: Implement task management API
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *                 default: todo
 *                 example: todo
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 example: medium
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-09-01T18:00:00.000Z
 *     responses:
 *       200:
 *         description: Task is added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

router.post('/add', authtenticateUser, validate(createTaskSchema), taskController.addTask)

/**
 * @swagger
 * /api/task/update/{taskId}:
 *   patch:
 *     summary: Update a task
 *     description: Update one or more fields of an existing task.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated task title
 *               description:
 *                 type: string
 *                 example: Updated task description
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *                 example: in_progress
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-09-05T18:00:00.000Z
 *     responses:
 *       201:
 *         description: Task is updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */

router.patch('/update/:taskId', authtenticateUser, validate(updateTaskSchema), taskController.updateTask)

/**
 * @swagger
 * /api/task/delete/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     description: Soft delete a task belonging to the authenticated user's organization.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       201:
 *         description: Task is deleted successfully
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */

router.delete('/delete/:taskId', authtenticateUser, taskController.deleteTask)
/**
 * @swagger
 * /api/task/{taskId}/assign:
 *   post:
 *     summary: Assign a task to a user
 *     description: Assign a task to a user belonging to the same organization.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
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
 *     responses:
 *       201:
 *         description: Task is assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: User does not belong to this organization
 *       404:
 *         description: Task not found
 *       409:
 *         description: User is already assigned to this task
 *       500:
 *         description: Internal server error
 */

router.post('/:taskId/assign', authtenticateUser, validate(assignTaskSchema), taskController.assignTask)

/**
 * @swagger
 * /api/task/{taskId}/unassign/{userId}:
 *   delete:
 *     summary: Unassign a user from a task
 *     description: Remove an assigned user from a task.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       201:
 *         description: Task is unassigned successfully
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Task not found or user is not assigned to this task
 *       500:
 *         description: Internal server error
 */

router.delete('/:taskId/unassign/:userId', authtenticateUser, taskController.unassignTask)

/**
 * @swagger
 * /api/task/{taskId}/comment:
 *   post:
 *     summary: Add a comment to a task
 *     description: Add a comment to a task belonging to the authenticated user's organization.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Task ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: This task is almost completed.
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: You are not allowed to access this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */

router.post('/:taskId/comment',authtenticateUser,validate(addCommentSchema),taskController.addComment)




/**
 * @swagger
 * /api/task/bulk-status:
 *   patch:
 *     summary: Bulk update task status
 *     description: Update the status of multiple tasks belonging to the authenticated user's organization.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *               - status
 *             properties:
 *               taskIds:
 *                 type: array
 *                 minItems: 1
 *                 uniqueItems: true
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *                 example: done
 *     responses:
 *       201:
 *         description: Status are updated in bulk
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: No valid tasks found
 *       500:
 *         description: Internal server error
 */

router.patch('/bulk-status', authtenticateUser, validate(bulkUpdateTaskStatusSchema), taskController.updateBulkStatus)


export default router;