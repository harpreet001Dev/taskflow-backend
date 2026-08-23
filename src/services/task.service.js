import prisma from "../config/database.js"
import ApiError from "../utils/apiError.js"
import emailQueue from "../queues/email.queue.js";
import getPagination from "../utils/pagination.js";

const getAllTasks = async (user, query) => {
    const { page, limit, skip } = getPagination(query);

    const {
        status,
        priority,
        assignee,
        dueDateFrom,
        dueDateTo,
        q,
    } = query;
    // console.log(dueDateFrom, typeof dueDateFrom);
    // console.log(dueDateTo, typeof dueDateTo);

    const where = {
        project: {
            organizationId: user.org_id,
            deletedAt: null //filter if project is deleted then avoid fetching task 
        },
        deletedAt: null,
    };
    const search = q?.trim();

    // Status filter
    if (status) {
        where.status = status;
    }

    // Priority filter
    if (priority) {
        where.priority = priority;
    }
    //assignee filter 
    if (assignee) {
        where.assignments = {
            some: {
                userId: Number(assignee),
            },
        };
    }

    // Due-date range filter
    if (dueDateFrom || dueDateTo) {
        where.dueDate = {};

        if (dueDateFrom) {
            where.dueDate.gte = new Date(dueDateFrom);
        }

        if (dueDateTo) {
            where.dueDate.lte = new Date(dueDateTo);
        }
    }

    let searchTaskIds = null;

    if (search) {
        const results = await prisma.$queryRaw`
            SELECT t.id
            FROM tasks t
            INNER JOIN projects p
                ON p.id = t."projectId"
            WHERE p."organizationId" = ${user.org_id}
              AND p."deletedAt" IS NULL
              AND t."deletedAt" IS NULL
              AND to_tsvector(
                    'english',
                    t.title || ' ' || COALESCE(t.description, '')
                  )
                  @@ websearch_to_tsquery('english', ${search})
        `;

        searchTaskIds = results.map((task) => task.id);
    }

    // Apply search results to existing Prisma query
    if (searchTaskIds !== null) {
        where.id = {
            in: searchTaskIds,
        };
    }
    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.task.count({
            where,
        }),
    ])
    return {
        data: tasks,
        total,
        page,
        limit,
    };
}

const getTaskById = async (taskId, user) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
            project: {
                deletedAt: null,
            },
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.project.organizationId !== user.org_id) {
        throw new ApiError(403, "Forbidden");
    }

    return task;
};

const addTask = async (data, user) => {
    const {
        projectId,
        title,
        description,
        status,
        priority,
        dueDate,
    } = data;
    //checking project exits and not soft deleted
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            deletedAt: null,
        }
    })
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    // user belong to the same org of project
    if (project.organizationId !== user.org_id) {
        throw new ApiError(403, "You are not allowed to access this project");
    }
    const task = await prisma.task.create({
        data: {
            projectId,
            title,
            description,
            status,
            priority,
            dueDate,
        },
    });
    return task
}

const updateTask = async (taskId, data, user) => {
    const {
        title,
        description,
        status,
        priority,
        dueDate,
    } = data;

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
            project: {
                deletedAt: null,
            },
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    // checking user is updating its own org task 
    if (task.project.organizationId !== user.org_id) {
        throw new ApiError(403, "You are not allowed to access this task");
    }

    //user can update 1 or many fields
    const updatedTask = await prisma.task.update({
        where: {
            id: task.id,
        },
        data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
            ...(priority !== undefined && { priority }),
            ...(dueDate !== undefined && { dueDate }),
        },
    });

    return updatedTask;
}

const deleteTask = async (taskId, user) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
            project: {
                deletedAt: null,
            },
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.project.organizationId !== user.org_id) {
        throw new ApiError(403, "You are not allowed to access this task");
    }
    await prisma.task.update({
        where: {
            id: task.id,

        },
        data: {
            deletedAt: new Date(), //soft delete
        },
    })
}

const assignTask = async (taskId, data, user) => {
    const { userId } = data;

     // Check whether task exists and is not deleted
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
            project: {
                deletedAt: null,
            },
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check task belongs to user's organization
    if (task.project.organizationId !== user.org_id) {
        throw new ApiError(
            403,
            "You are not allowed to access this task"
        );
    }
    //checking assigned user belongs to same org
    const member = await prisma.orgMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId: user.org_id,
                userId,
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    })

    if (!member) {
        throw new ApiError(
            403,
            "User does not belong to this organization"
        );
    }

    // Checking if user is already assigned to this task
    const existingAssignment = await prisma.taskAssignment.findUnique({
        where: {
            taskId_userId: {
                taskId: task.id,
                userId,
            },
        },
    });

    if (existingAssignment) {
        throw new ApiError(
            409,
            "User is already assigned to this task"
        );
    }
    let assignment;
    try {
        assignment = await prisma.taskAssignment.create({
            data: {
                taskId: task.id,
                userId,
            },
        });

        await emailQueue.add("task-assigned",
            {
                taskId: task.id,
                taskTitle: task.title,
                userId: member.user.id,
                userName: member.user.name,
                userEmail: member.user.email,
            },
            {
                // max attempts 4 (1-initial attempt,3 retry)
                attempts: 4,
                //backoffs -1s-2s-4s
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            }
        );
    } catch (error) {
        if (assignment) {
            await prisma.taskAssignment.delete({
                where: {
                    id: assignment.id,
                },
            });
        }

        throw error;
    }

    return assignment;
}

const unassignTask = async (taskId, userId, user) => {
      // Check whether task exists and is not deleted
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
            project: {
                deletedAt: null,
            },
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check task belongs to user's organization
    if (task.project.organizationId !== user.org_id) {
        throw new ApiError(
            403,
            "You are not allowed to access this task"
        );
    }
    // Checking assignment exists
    const assignment = await prisma.taskAssignment.findUnique({
        where: {
            taskId_userId: {
                taskId: task.id,
                userId,
            },
        },
    });

    if (!assignment) {
        throw new ApiError(
            404,
            "User is not assigned to this task"
        );
    }
    await prisma.taskAssignment.delete({
        where: {
            taskId_userId: {
                taskId: task.id,
                userId,
            },
        },
    });

}

const bulkUpdateTaskStatus = async (data, user) => {
    const { taskIds, status } = data;

    //finding tasks
    const tasks = await prisma.task.findMany({
        where: {
            id: {
                in: taskIds,
            },
            deletedAt: null,
            project: {
                deletedAt: null,
            },
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });

    if (tasks.length === 0) {
        throw new ApiError(404, "No valid tasks found");
    }

    // Check for tasks belong to same org
    const hasForeignTask = tasks.some(
        (task) => task.project.organizationId !== user.org_id
    );

    if (hasForeignTask) {
        throw new ApiError(
            403,
            "You are not allowed to access one or more tasks"
        );
    }

    //array of validated task ids
    const validTaskIds = tasks.map((task) => task.id);

    const result = await prisma.task.updateMany({
        where: {
            id: {
                in: validTaskIds,
            },
            project: {
                organizationId: user.org_id,
                deletedAt: null,
            },
            deletedAt: null,
        },
        data: {
            status,
        },
    });

    return {
        updatedCount: result.count,
        taskIds: validTaskIds,
        status,
    };
}

const addComment = async (taskId, content, user) => {
    // Checking task exists and is not deleted
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            deletedAt: null,
            project: {
                deletedAt: null,
            },
        },
        include: {
            project: {
                select: {
                    organizationId: true,
                },
            },
        },
    });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Checking task belongs to authenticated users organization
    if (task.project.organizationId !== user.org_id) {
        throw new ApiError(
            403,
            "You are not allowed to access this task"
        );
    }

    //creating comment
    const comment = await prisma.comment.create({
        data: {
            taskId: task.id,
            userId: user.id,
            content,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return comment;
};

export default {
    getAllTasks,
    getTaskById,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,
    addComment,
    bulkUpdateTaskStatus,
}