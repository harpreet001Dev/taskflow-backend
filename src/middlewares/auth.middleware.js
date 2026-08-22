import prisma from "../config/database.js";
import ApiError from "../utils/apiError.js";
import jwt from 'jsonwebtoken';


const authtenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Missing auth token")
        }
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const userId = Number(decoded.sub);
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        })
        if (!user) {
            throw new ApiError(401, "Unauthorized User")
        }
        const membership = await prisma.orgMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: Number(decoded.org_id),
                    userId: user.id,
                },
            },
        });

        if (!membership) {
            throw new ApiError(
                403,
                "User is not a member of this organization"
            );
        }
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            org_id: membership.organizationId,
            role: membership.role,
        };
        next();
    } catch (error) {
        console.error("JWT ERROR:", error.name, error.message);

        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Token is Expired!"));
        }

        return next(new ApiError(401, "Invalid auth token"));
    }


}

export default authtenticateUser