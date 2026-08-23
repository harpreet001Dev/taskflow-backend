import asyncHandler from "../utils/asyncHandler.js";
import taskService from "../services/task.service.js";

export const getTasks = asyncHandler(async (req, res) => {
    const tasks = await taskService.getAllTasks(req.user, req.query);
    return res.status(200).json({
        success: true,
        message: "All tasks are fetched successfully",
        data: tasks,
    });
});

export const getTaskById = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(Number(req.params.taskId), req.user);
    return res.status(200).json({
        success: true,
        message: "Task is fetched successfully",
        data: task,
    });
});

export const addTask = asyncHandler(async (req, res) => {
    const task = await taskService.addTask(req.body, req.user);
    return res.status(200).json({
        success: true,
        message: "Task is added successfully",
        data: task,
    });
});

export const updateTask = asyncHandler(async (req, res) => {
    // console.log(req.params.taskId);
    const task = await taskService.updateTask(
        Number(req.params.taskId),
        req.body,
        req.user);
    return res.status(201).json({
        success: true,
        message: "Task is updated successfully",
        data: task,
    });
});

export const deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(
        Number(req.params.taskId),
        req.user);
    return res.status(201).json({
        success: true,
        message: "Task is deleted successfully",
    });
});

export const assignTask = asyncHandler(async (req, res) => {
    await taskService.assignTask(
        Number(req.params.taskId),
        req.body,
        req.user
    );
    return res.status(201).json({
        success: true,
        message: "Task is assigned successfully",
    });
});

export const unassignTask = asyncHandler(async (req, res) => {
    await taskService.unassignTask(
        Number(req.params.taskId),
        Number(req.params.userId),
        req.user
    );
    return res.status(201).json({
        success: true,
        message: "Task is unassigned successfully",
    });
});

export const updateBulkStatus = asyncHandler(async (req, res) => {
    await taskService.bulkUpdateTaskStatus(
        req.body,
        req.user
    );
    return res.status(201).json({
        success: true,
        message: "Status are updated in bulk",
    });
});

const addComment = async (req, res) => {
    const { content } = req.body;

    const comment = await taskService.addComment(
        Number(req.params.taskId),
        content,
        req.user
    );

    return res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
    });
};

export default {
    getTasks,
    getTaskById,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,
    addComment,
    updateBulkStatus,
}