import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { showId, episodeId, episodeName, isWatched } = await request.json();
    
    if (isWatched) {
      // Verifica se já existe para evitar duplicação
      const existingEpisode = await prisma.watchedEpisode.findUnique({
        where: {
          showId_episodeId: {
            showId: showId,
            episodeId: episodeId
          }
        }
      });

      if (!existingEpisode) {
        await prisma.watchedEpisode.create({
          data: {
            episodeId: episodeId,
            episodeName: episodeName,
            showId: showId
          }
        });
      }
    } else {
      await prisma.watchedEpisode.deleteMany({
        where: {
          showId: showId,
          episodeId: episodeId
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating watched episode:', error);
    return NextResponse.json({ error: 'Failed to update watched episode' }, { status: 500 });
  }
} 