import request from "supertest";
import app from "../../app.js";

describe("Auth Integration Tests", () => {
    test("login should succeed with valid credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "aman@example.com",
                password: "Password@123",
            });
        console.log(response.body);


        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("success");

        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.accessToken).toBeDefined();
        expect(response.body.data.refreshToken).toBeDefined();
    });
});