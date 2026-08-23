import "dotenv/config";
import { jest } from "@jest/globals";

// Mock Prisma
jest.unstable_mockModule("../../src/config/database.js", () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock password utility
jest.unstable_mockModule("../../src/utils/password.js", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  
}));

// Import mocked Prisma and auth service
const { default: prisma } = await import("../../src/config/database.js");
const { default: authService } = await import("../../src/services/auth.service.js");
const { comparePassword } = await import("../../src/utils/password.js");

//------------start login testing
test("login should fail when user does not exist", async () => {
  // Pretending db could not find the user
  prisma.user.findUnique.mockResolvedValue(null);

  // Calling login function
  await expect(
    authService.login({
      email: "unknown@example.com",
      password: "wrongpassword",
    })
  ).rejects.toMatchObject({
    statusCode: 401,
    message: "Invalid Credentials!",
  });
});

test("login should fail when password is incorrect", async () => {
  prisma.user.findUnique.mockResolvedValue({
    id: 1,
    name: "Aman",
    email: "aman@example.com",
    password: "hashed-password",
  });

  //returnig false on password comparion for test
  comparePassword.mockResolvedValue(false);

  await expect(
    authService.login({
      email: "aman@example.com",
      password: "wrongpassword",
    })
  ).rejects.toMatchObject({
    statusCode: 401,
    message: "Invalid Credentials!",
  });
});

test("login should fail when user has no organization membership", async () => {
  prisma.user.findUnique.mockResolvedValue({
    id: 1,
    name: "Aman",
    email: "aman@example.com",
    password: "hashed-password",
  });

  comparePassword.mockResolvedValue(true);

  prisma.orgMember = {
    findFirst: jest.fn(),
  };

  prisma.orgMember.findFirst.mockResolvedValue(null);

  await expect(
    authService.login({
      email: "aman@example.com",
      password: "correctpassword",
    })
  ).rejects.toMatchObject({
    statusCode: 403,
    message:
      "You are not a member of any organization. Please contact your organization admin.",
  });
});

test("login should succeed with valid credentials and organization membership", async () => {
  prisma.user.findUnique.mockResolvedValue({
    id: 1,
    name: "Aman",
    email: "aman@example.com",
    password: "hashed-password",
  });

  comparePassword.mockResolvedValue(true);

  prisma.orgMember.findFirst.mockResolvedValue({
    organizationId: 1,
    role: "member",
  });

  prisma.refreshToken = {
    create: jest.fn().mockResolvedValue({
      id: 1,
    }),
  };

  const result = await authService.login({
    email: "aman@example.com",
    password: "correctpassword",
  });

  expect(result.user).toEqual({
    id: 1,
    name: "Aman",
    email: "aman@example.com",
  });

  expect(result.accessToken).toBeDefined();
  expect(result.refreshToken).toBeDefined();
});

//------------End login testing

//------------start register testing

test("register should fail when user already exists", async () => {
  prisma.user.findUnique.mockResolvedValue({
    id: 1,
    email: "aman@example.com",
  });

  await expect(
    authService.register({
      name: "Aman",
      email: "aman@example.com",
      password: "password123",
    })
  ).rejects.toMatchObject({
    statusCode: 409,
    message: "User already exists, Please Login!",
  });
});

test("register should successfully create a new user", async () => {
  prisma.user.findUnique.mockResolvedValue(null);

  prisma.user.create.mockResolvedValue({
    id: 2,
    email: "newuser@example.com",
    createdAt: new Date(),
  });

  const result = await authService.register({
    name: "New User",
    email: "newuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    id: 2,
    email: "newuser@example.com",
    createdAt: expect.any(Date),
  });

  expect(prisma.user.create).toHaveBeenCalled();
});

//------------end register testing

//------------start refresh token testing
test("refresh should fail when refresh token is missing", async () => {
  await expect(
    authService.refresh()
  ).rejects.toMatchObject({
    statusCode: 401,
    message: "Refresh token is required",
  });
});

test("refresh should fail with invalid refresh token", async () => {
  prisma.refreshToken = {
    findMany: jest.fn(),
  };

  prisma.refreshToken.findMany.mockResolvedValue([]);

  await expect(
    authService.refresh("invalid-refresh-token")
  ).rejects.toMatchObject({
    statusCode: 401,
    message: "Invalid or expired refresh token",
  });
});

test("refresh should fail when refresh token does not match stored token", async () => {
  prisma.refreshToken = {
    findMany: jest.fn(),
  };

  prisma.refreshToken.findMany.mockResolvedValue([
    {
      id: 1,
      userId: 1,
      tokenHash: "stored-hash",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  ]);

  comparePassword.mockResolvedValue(false);

  await expect(
    authService.refresh("wrong-refresh-token")
  ).rejects.toMatchObject({
    statusCode: 401,
    message: "Invalid or expired refresh token",
  });
});

test("refresh should succeed with a valid refresh token", async () => {
  prisma.refreshToken = {
    findMany: jest.fn(),
  };

  prisma.user = {
    findUnique: jest.fn(),
  };

  prisma.orgMember = {
    findFirst: jest.fn(),
  };

  prisma.refreshToken.findMany.mockResolvedValue([
    {
      id: 1,
      userId: 1,
      tokenHash: "stored-hash",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  ]);

  comparePassword.mockResolvedValue(true);

  prisma.user.findUnique.mockResolvedValue({
    id: 1,
    name: "Aman",
    email: "aman@example.com",
  });

  prisma.orgMember.findFirst.mockResolvedValue({
    organizationId: 1,
    role: "member",
  });

  const result = await authService.refresh("valid-refresh-token");

  expect(result.accessToken).toBeDefined();
});
//------------end refreshtoken testing

//------------start logout testing
test("logout should fail when refresh token is missing", async () => {
  await expect(
    authService.logout()
  ).rejects.toMatchObject({
    statusCode: 401,
    message: "Refresh token is required",
  });
});

test("logout should fail with invalid refresh token", async () => {
  prisma.refreshToken = {
    findMany: jest.fn(),
  };

  prisma.refreshToken.findMany.mockResolvedValue([]);

  await expect(
    authService.logout("invalid-refresh-token")
  ).rejects.toMatchObject({
    statusCode: 401,
    message: "Invalid refresh token",
  });
});

test("logout should successfully revoke a valid refresh token", async () => {
  prisma.refreshToken = {
    findMany: jest.fn(),
    update: jest.fn(),
  };

  prisma.refreshToken.findMany.mockResolvedValue([
    {
      id: 1,
      userId: 1,
      tokenHash: "stored-hash",
      revokedAt: null,
    },
  ]);

  comparePassword.mockResolvedValue(true);

  prisma.refreshToken.update.mockResolvedValue({
    id: 1,
    revokedAt: new Date(),
  });

  const result = await authService.logout("valid-refresh-token");

  expect(result).toEqual({
    message: "Logged out successfully",
  });

  expect(prisma.refreshToken.update).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        id: 1,
      },
      data: expect.objectContaining({
        revokedAt: expect.any(Date),
      }),
    })
  );
});
//------------end logout testing
