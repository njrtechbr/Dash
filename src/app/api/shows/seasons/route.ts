import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { showId, seasonEpisodes, markAsWatched } = await request.json();
    
    if (markAsWatched) {
      // Adiciona todos os episódios da temporada
      const episodesToAdd = seasonEpisodes.map((ep: any) => ({
        episodeId: `S${ep.season_number}E${ep.episode_number}`,
        episodeName: ep.name,
        showId: showId
      }));

      // Usa createMany que vai ignorar duplicatas se houver conflito
      await prisma.watchedEpisode.createMany({
        data: episodesToAdd,
        skipDuplicates: true
      });
    } else {
      // Remove todos os episódios da temporada
      const seasonEpisodeIds = seasonEpisodes.map((ep: any) => `S${ep.season_number}E${ep.episode_number}`);
      
      await prisma.watchedEpisode.deleteMany({
        where: {
          showId: showId,
          episodeId: {
            in: seasonEpisodeIds
          }
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating season watched episodes:', error);
    return NextResponse.json({ error: 'Failed to update season watched episodes' }, { status: 500 });
  }
} 