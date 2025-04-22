// src/app/api/notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface NoteInput {
  title: string;
  content?: string;
  isPublic: boolean;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  try {
    const isLoggedIn = !!session?.user?.id;

    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { isPublic: true },
          ...(isLoggedIn ? [{ userId: session.user.id }] : []),
        ],
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Error fetching notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const body: NoteInput = await request.json();
  const { title, content, isPublic } = body;

  try {
    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        isPublic,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Error creating note" }, { status: 500 });
  }
}
