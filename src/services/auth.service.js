import prisma from "../config/database.js";
import { hashPassword, comparePassword } from '../utils/password.js';
import ApiError from "../utils/apiError.js";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const AUTH_MODE = "production"; //set auth mode test for testing
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const AUTH_CONFIG = {
    test: {
        accessTokenExpiresIn: "1m",
        refreshTokenExpiresInMinutes: 2,
    },

    production: {
        accessTokenExpiresIn: "15m",
        refreshTokenExpiresInMinutes: 7 * 24 * 60,
    },
};
const currentAuthConfig = AUTH_CONFIG[AUTH_MODE];


function generateAccessToken(user, membership) {
    return jwt.sign(
        {
            sub: user.id,
            org_id: membership.organizationId,
            role: membership.role,
        },
        ACCESS_SECRET,
        {
            expiresIn: currentAuthConfig.accessTokenExpiresIn,
        }
    );
}

// Refresh Token
async function generateRefreshToken(user) {
    const token = crypto.randomBytes(40).toString("hex");

    const tokenHash = await hashPassword(token);

    const expiresAt = new Date(
        Date.now() +
        currentAuthConfig.refreshTokenExpiresInMinutes * 60 * 1000
    );

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt,
        },
    });

    return token;
}


const register = async (data) => {
    const { name, email, password } = data;
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })
    if (isUserExist) {
        throw new ApiError(409, "User already exists, Please Login!");
    }

    const protectedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: protectedPassword
        },
        select: {
            id: true,
            email: true,
            createdAt: true
        }
    });
    return user;

}


const login = async (data) => {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        throw new ApiError(401, "Invalid Credentials!")
    }

    const matchPassword = await comparePassword(password, user.password);
    if (!matchPassword) {
        throw new ApiError(401, 'Invalid Credentials!')
    }
    const membership = await prisma.orgMember.findFirst({
        where: {
            userId: user.id
        }
    });
    //if no membership ask admin to make user memer
    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of any organization. Please contact your organization admin."
        );
    }
    // console.log(membership,"membership");

    const accessToken = generateAccessToken(user, membership);
    const refreshToken = await generateRefreshToken(user);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        accessToken,
        refreshToken
    };

}

const refresh = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }
    const refreshTokens = await prisma.refreshToken.findMany({
        where: {
            revokedAt: null,
            expiresAt: {
                gt: new Date(),
            }
        }
    })
    console.log(refreshTokens, "refreshTokens");

    let storedToken = null;
    for (const tokenRecord of refreshTokens) {
        const isMatch = await comparePassword(
            refreshToken,
            tokenRecord.tokenHash
        );

        if (isMatch) {
            storedToken = tokenRecord;
            break;
        }
    }

    if (!storedToken) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: storedToken.userId,
        },
    });

    if (!user) {
        throw new ApiError(401, "Unauthorized user");
    }

    const membership = await prisma.orgMember.findFirst({
        where: {
            userId: user.id,
        },
    });

    if (!membership) {
        throw new ApiError(
            403,
            "You are not a member of any organization"
        );
    }

    const accessToken = generateAccessToken(user, membership);

    return {
        accessToken,
    };
}

const logout = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const refreshTokens = await prisma.refreshToken.findMany({
        where: {
            revokedAt: null,
        },
    });

    let storedToken = null;

    for (const tokenRecord of refreshTokens) {
        const isMatch = await comparePassword(
            refreshToken,
            tokenRecord.tokenHash
        );

        if (isMatch) {
            storedToken = tokenRecord;
            break;
        }
    }

    if (!storedToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    await prisma.refreshToken.update({
        where: {
            id: storedToken.id,
        },
        data: {
            revokedAt: new Date(),
        },
    });

    return {
        message: "Logged out successfully",
    };
};


export default { register, login, refresh, logout }