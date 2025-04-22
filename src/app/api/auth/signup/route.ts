// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: " Email and password are required" }, { status: 400 });
  }

  // Check if user already exist
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create new user with hashed password
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // You can add more fields to the user like 'name' if needed

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}
