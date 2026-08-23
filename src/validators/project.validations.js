import joi from "joi";

export const getAllProjectsSchema = joi.object({
    page: joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
});

export const createProjectSchema = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Project name is required",
            "string.min": "Project name must be at least 2 characters",
            "string.max": "Project name cannot exceed 100 characters",
            "any.required": "Project name is required",
        }),

    description: joi.string()
        .trim()
        .max(500)
        .allow("", null)
        .optional()
        .messages({
            "string.max": "Project description cannot exceed 500 characters",
        }),
});

export const updateProjectSchema = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    description: joi.string()
        .trim()
        .max(500)
        .allow("", null)
        .optional(),
}).min(1);