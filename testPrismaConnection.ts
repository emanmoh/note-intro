const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Connecting to the database...");
    const result = await prisma.note.findMany();
    console.log("Query result:", result);  // Log resultatet af forespørgslen
  } catch (error) {
    console.error('Error fetching notes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
