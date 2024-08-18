// Importing the PrismaClient class from Prisma
import { PrismaClient } from "@prisma/client";

// Function to create a new Prisma client instance
const createPrismaClient = () => {
  return new PrismaClient();
};

// Declaring a global variable to store the Prisma client instance (avoids multiple instances)
declare global {
  // Ensuring the global variable is typed correctly
  var prismaGlobal: ReturnType<typeof createPrismaClient> | undefined;
}

// Assigning the Prisma client instance to the global variable if it doesn't already exist
const prisma = globalThis.prismaGlobal ?? createPrismaClient();

// Exporting the Prisma client instance for use in other parts of the application
export default prisma;

// Ensuring that the Prisma client instance is not recreated during hot reloading in development mode
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
