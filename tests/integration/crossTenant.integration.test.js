import request from "supertest";
import app from "../../app.js";

describe("Cross-Tenant Access Integration Tests", () => {
    let amanToken;
    let rahulToken;
    let amanTaskId;

    beforeAll(async () => {
        // Login as Aman - from Organization 1
        const amanLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "aman@example.com",
                password: "Password@123",
            });

        expect(amanLogin.statusCode).toBe(200);

        amanToken = amanLogin.body.data.accessToken;

        // Getting a task belonging to Aman's organization
        const tasksResponse = await request(app)
            .get("/api/task")
            .set("Authorization", `Bearer ${amanToken}`);

        expect(tasksResponse.statusCode).toBe(200);

        amanTaskId = tasksResponse.body.data.data[0].id;

        // Login as Rahul from Organization 2
        const rahulLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "rahul@example.com",
                password: "Password@123",
            });

        expect(rahulLogin.statusCode).toBe(200);

        rahulToken = rahulLogin.body.data.accessToken;
    });

    test("should return 403 when accessing another organization's task", async () => {
        const response = await request(app)
            .get(`/api/task/${amanTaskId}`)
            .set("Authorization", `Bearer ${rahulToken}`);

        expect(response.statusCode).toBe(403);

        expect(response.body.data).toBeUndefined();
    });
});