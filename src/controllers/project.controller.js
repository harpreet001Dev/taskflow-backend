import asyncHandler from "../utils/asyncHandler.js";
import projectService from "../services/project.service.js";

export const getProjects = asyncHandler(async (req, res) => {
    const project = await projectService.getAllProjects(req.user, req.query);
    return res.status(200).json({
        success: true,
        message: "All Projects are fetched successfully",
        data: project,
    });
});

export const getProject = asyncHandler(async (req, res) => {
    const project = await projectService.getProjectById(
        Number(req.params.projectId),
        req.user);
    return res.status(200).json({
        success: true,
        message: "Project is fetched successfully",
        data: project,
    });
})

export const addProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject(req.body, req.user);
    return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
    });
})

export const updateProject = asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(
        Number(req.params.projectId),
        req.body,
        req.user);
    return res.status(201).json({
        success: true,
        message: "Project updated successfully",
        data: project,
    });
})

export const deleteProject = asyncHandler(async (req, res) => {
    await projectService.deleteProjectById(
        Number(req.params.projectId),
        req.user
    )
    return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
    });
})

export const getDashboard = asyncHandler(async (req, res) => {
    const dashboard = await projectService.getProjectDashboard(
        Number(req.params.projectId),
        req.user
    );

    return res.status(200).json({
        success: true,
        message: "Project dashboard fetched successfully",
        data: dashboard,
    });
})

export default {
    getProjects,
    getProject,
    addProject,
    updateProject,
    deleteProject,
    getDashboard
}