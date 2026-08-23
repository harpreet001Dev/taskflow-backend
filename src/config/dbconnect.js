import prisma from "./database.js";

export const connectDatabase = async () => {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");
};

export const disconnectDatabase = async () => {
    await prisma.$disconnect();
};