import prisma from "../config/database.js";
import ApiError from "../utils/apiError.js";

const addMember = async (userId, organizationId) => {
    // Checking that the registered user exists
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Checking whether user is already a member of this organization
    const existingMember = await prisma.orgMember.findUnique({
        where: {
            organizationId_userId: {
                organizationId,
                userId,
            },
        },
    });

    if (existingMember) {
        throw new ApiError(409, "User is already a member of this organization");
    }

    const member = await prisma.orgMember.create({
        data: {
            organizationId,
            userId,
            role: "member",
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return member;
};

export default {addMember}