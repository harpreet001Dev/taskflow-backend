import prisma from "../config/database.js"
import ApiError from "../utils/apiError.js"
import getPagination from "../utils/pagination.js";

const getAllProjects = async (user, query) => {
    const { page, limit, skip } = getPagination(query);

    //fetching projects based on org id
    const where = {
        organizationId: user.org_id,
        deletedAt: null,
    };
    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.project.count({
            where,
        }),
    ])
    return {
        data: projects,
        total,
        page,
        limit,
    };
}

//find project based on project id
const getProjectById = async (projectId, user) => {
    // First checking whether the project exists and is not soft-deleted
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            deletedAt: null,
        },
    });

    // Project does not exist
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Project exists, but belongs to another organization
    if (project.organizationId !== user.org_id) {
        throw new ApiError(
            403,
            "You are not allowed to access this project"
        );
    }
    // console.log(project,"project");

    return project
}

const createProject = async (data, user) => {
    const { name, description } = data;

    //verify user belongs to this org
    const membership = await prisma.orgMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId: user.org_id,
                userId: user.id,
            },
        },
    });
    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of this organization"
        );
    }

    const project = await prisma.project.create({
        data: {
            name,
            description,
            organizationId: membership.organizationId,
        },
    });

    return project;
}

const updateProject = async (projectId, data, user) => {
    const { name, description } = data;

    //checking project is not soft deleted
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            deletedAt: null,
        },
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    //Making sure that the  project belongs to the user's organization
    if (project.organizationId !== user.org_id) {
        throw new ApiError(
            403,
            "You are not allowed to access this project"
        );
    }


    const updateProject = await prisma.project.update({
        where: {
            id: project.id
        },
        //used spread operator so that only given field are updated
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
        }
    })
    return updateProject;
}

const deleteProjectById = async (projectId, user) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            deletedAt: null,
        },
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    //checking project belong to users org
    if (project.organizationId !== user.org_id) {
        throw new ApiError(
            403,
            "You are not allowed to access this project"
        );
    }
    await prisma.project.update({
        where: {
            id: project.id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
}

const getProjectDashboard = async (projectId, user) => {

    //checking project belongs to users org
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            deletedAt: null,
        },
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    //check for roject belong to users org
    if (project.organizationId !== user.org_id) {
        throw new ApiError(
            403,
            "You are not allowed to access this project"
        );
    }
    const taskCounts = await prisma.task.groupBy({
        by: ["status"],
        where: {
            projectId: project.id,
            deletedAt: null,
        },
        _count: {
            _all: true,
        },
    });
    const dashboard = {
        todo: 0,
        in_progress: 0,
        review: 0,
        done: 0,
    };

    taskCounts.forEach((item) => {
        dashboard[item.status] = item._count._all;
    });
    return dashboard;
}

export default {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProjectById,
    getProjectDashboard,
}