import request from "supertest";
import app from "../../app.js";

describe("Task CRUD Integration Tests", () => {
    let accessToken;
    let projectId;
    let taskId;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: "aman@example.com",
                password: "Password@123",
            });
        console.log(loginResponse.body);
        expect(loginResponse.statusCode).toBe(200);

        accessToken = loginResponse.body.data.accessToken;

        const projectResponse = await request(app)
            .get("/api/project")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(projectResponse.statusCode).toBe(200);

        projectId = projectResponse.body.data.data[0].id;
    });

    test("should create a task", async () => {
        const response = await request(app)
            .post("/api/task/add")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                projectId,
                title: "Integration Test Task",
                description: "Created during integration testing",
                status: "todo",
                priority: "medium",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();

        taskId = response.body.data.id;
    });

    test("should get the created task", async () => {
        const response = await request(app)
            .get(`/api/task/${taskId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(taskId);
    });

    test("should update the created task", async () => {
        const response = await request(app)
            .patch(`/api/task/update/${taskId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                title: "Updated Integration Test Task",
                status: "in_progress",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(
            "Updated Integration Test Task"
        );
    });

    test("should delete the created task", async () => {
        const response = await request(app)
            .delete(`/api/task/delete/${taskId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
    });
});