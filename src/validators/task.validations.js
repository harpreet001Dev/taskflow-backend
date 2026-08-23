import joi from "joi";

export const getAllTaskSchema = joi.object({
    page: joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
    status: joi.string()
        .valid("todo", "in_progress", "review", "done")
        .optional(),

    priority: joi.string()
        .valid("low", "medium", "high", "urgent")
        .optional(),

    assignee: joi.number()
        .integer()
        .optional(),
    dueDateFrom: joi.date()
        .optional(),

    dueDateTo: joi.date()
        .optional(),
});

export const createTaskSchema = joi.object({
    projectId: joi.number()
        .integer()
        .required(),

    title: joi.string()
        .trim()
        .required(),

    description: joi.string()
        .trim()
        .allow("")
        .optional(),

    status: joi.string()
        .valid("todo", "in_progress", "review", "done")
        .default("todo"),

    priority: joi.string()
        .valid("low", "medium", "high", "urgent")
        .default("medium"),
    dueDate: joi.date()
        .optional()
})

export const updateTaskSchema = joi.object({
    title: joi.string()
        .trim()
        .optional(),

    description: joi.string()
        .trim()
        .allow("")
        .optional(),

    status: joi.string()
        .valid("todo", "in_progress", "review", "done")
        .optional(),

    priority: joi.string()
        .valid("low", "medium", "high", "urgent")
        .optional(),
    dueDate: joi.date()
        .optional()
}).min(1);

export const assignTaskSchema = joi.object({
    userId: joi.number()
        .integer()
        .required(),
});


export const addCommentSchema = joi.object({
    content: joi.string()
        .trim()
        .min(1)
        .required()
        .messages({
            "string.empty": "Comment content is required",
            "string.min": "Comment content cannot be empty",
            "any.required": "Comment content is required",
        }),
});

export const bulkUpdateTaskStatusSchema = joi.object({
    taskIds: joi.array()
        .items(
            joi.number()
                .integer()
                .positive()
                .required()
        )
        .min(1)
        .unique()
        .required(),

    status: joi.string()
        .valid("todo", "in_progress", "review", "done")
        .required(),
});