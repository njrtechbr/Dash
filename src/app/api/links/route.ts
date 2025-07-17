import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return NextResponse.json(links.map(link => ({
      ...link,
      description: link.description || undefined
    })));
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (Array.isArray(body)) {
      // Criar múltiplos links
      await prisma.link.createMany({
        data: body.map(link => ({
          ...link,
          isFavorite: false,
        }))
      });
      return NextResponse.json({ success: true });
    } else {
      // Criar um link
      const link = await prisma.link.create({
        data: {
          ...body,
          isFavorite: false,
        }
      });
      return NextResponse.json(link);
    }
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
} 