// src/app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;  
  const { id } = params;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, isPublic } = body;

  try {
    // Tjek 
    const note = await prisma.note.findUnique({ where: { id: Number(id) } });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedNote = await prisma.note.update({
      where: { id: Number(id) },
      data: { title, content, isPublic },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Error updating note" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;   // await params
  const { id } = params;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const note = await prisma.note.findUnique({ where: { id: Number(id) } });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedNote = await prisma.note.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedNote);
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Error deleting note" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;  
  const { id } = params;

  const session = await getServerSession(authOptions);
  
  try {
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const isOwner = session?.user?.id === note.userId;
    const isPublic = note.isPublic;

    if (!isPublic && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

 return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Error fetching note" }, { status: 500 });
  }
}