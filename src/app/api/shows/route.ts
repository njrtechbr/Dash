import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const shows = await prisma.show.findMany({
      include: {
        watched_episodes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Convertemos para o formato esperado pelo tipo Show
    const formattedShows = shows.map(show => ({
      id: show.id,
      name: show.name,
      poster_path: show.poster_path,
      watched_episodes: show.watched_episodes.map(ep => ({
        id: ep.id,
        episodeId: ep.episodeId,
        episodeName: ep.episodeName,
        watchedAt: ep.watchedAt.toISOString(),
        showId: ep.showId
      }))
    }));
    
    return NextResponse.json(formattedShows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const show = await prisma.show.create({
      data: {
        id: body.id,
        name: body.name,
        poster_path: body.poster_path
      }
    });
    
    return NextResponse.json(show);
  } catch (error) {
    console.error('Error creating show:', error);
    return NextResponse.json({ error: 'Failed to create show' }, { status: 500 });
  }
} 