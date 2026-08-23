import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/config/database.js", () => ({
    default: {
        task: {
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },

        orgMember: {
            findUnique: jest.fn(),
        },

        taskAssignment: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.unstable_mockModule("../../src/queues/email.queue.js", () => ({
    default: {
        add: jest.fn(),
    },
}));

const { default: prisma } = await import("../../src/config/database.js");
const { default: taskService } = await import(
    "../../src/services/task.service.js"
);
const { default: emailQueue } = await import(
    "../../src/queues/email.queue.js"
);

test("assignTask should fail when task does not exist", async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(
        taskService.assignTask(
            1,
            { userId: 2 },
            { org_id: 1 }
        )
    ).rejects.toMatchObject({
        statusCode: 404,
        message: "Task not found",
    });
});

test("assignTask should fail when user does not belong to the organization", async () => {
    prisma.task.findFirst.mockResolvedValue({
        id: 1,
        title: "Test task",
    });

    prisma.orgMember.findUnique.mockResolvedValue(null);

    await expect(
        taskService.assignTask(
            1,
            { userId: 2 },
            { org_id: 1 }
        )
    ).rejects.toMatchObject({
        statusCode: 403,
        message: "User does not belong to this organization",
    });
});

test("assignTask should fail when user is already assigned", async () => {
    prisma.task.findFirst.mockResolvedValue({
        id: 1,
        title: "Test task",
    });


    prisma.orgMember.findUnique.mockResolvedValue({
        user: {
            id: 2,
            name: "Aman",
            email: "aman@example.com",
        },
    });

    prisma.taskAssignment.findUnique.mockResolvedValue({
        id: 10,
        taskId: 1,
        userId: 2,
    });

    await expect(
        taskService.assignTask(
            1,
            { userId: 2 },
            { org_id: 1 }
        )
    ).rejects.toMatchObject({
        statusCode: 409,
        message: "User is already assigned to this task",
    });
});

test("assignTask should successfully assign user to task", async () => {
    prisma.task.findFirst.mockResolvedValue({
        id: 1,
        title: "Test task",
    });

    prisma.orgMember.findUnique.mockResolvedValue({
        user: {
            id: 2,
            name: "Aman",
            email: "aman@example.com",
        },
    });

    prisma.taskAssignment.findUnique.mockResolvedValue(null);

    prisma.taskAssignment.create.mockResolvedValue({
        id: 10,
        taskId: 1,
        userId: 2,
    });

    prisma.taskAssignment.delete = jest.fn();

    const result = await taskService.assignTask(
        1,
        { userId: 2 },
        { org_id: 1 }
    );

    expect(result).toEqual({
        id: 10,
        taskId: 1,
        userId: 2,
    });

    expect(prisma.taskAssignment.create).toHaveBeenCalled();

    expect(emailQueue.add).toHaveBeenCalledWith(
        "task-assigned",
        expect.objectContaining({
            taskId: 1,
            taskTitle: "Test task",
            userId: 2,
            userName: "Aman",
            userEmail: "aman@example.com",
        }),
        expect.any(Object)
    );
});