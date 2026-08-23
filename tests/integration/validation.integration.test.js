import request from "supertest";
import app from "../../app.js";

describe("Validation/Error Integration Tests", () => {
    let accessToken;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: "aman@example.com",
                password: "Password@123",
            });

        expect(loginResponse.statusCode).toBe(200);

        accessToken = loginResponse.body.data.accessToken;
    });

    test("should return 400 when creating a task with missing required fields", async () => {
        const response = await request(app)
            .post("/api/task/add")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                projectId: 1,
                // title is intentionally missing
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.sucess).toBe(false);
        expect(response.body.message).toBe("Validation error");
        expect(response.body.errors).toBeDefined();
    });
});