import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { draggedId, targetId, currentLinks } = await request.json();
    
    const links = [...currentLinks];
    const draggedItemIndex = links.findIndex((l: any) => l.id === draggedId);
    const targetItemIndex = links.findIndex((l: any) => l.id === targetId);
    
    if (draggedItemIndex === -1 || targetItemIndex === -1) {
      return NextResponse.json({ error: 'Invalid link IDs' }, { status: 400 });
    }

    const [draggedItem] = links.splice(draggedItemIndex, 1);
    
    const newTargetIndex = links.findIndex((l: any) => l.id === targetId);
    links.splice(newTargetIndex > draggedItemIndex ? newTargetIndex : newTargetIndex, 0, draggedItem);
    
    // Atualizar usando uma transação para garantir consistência
    await prisma.$transaction(
      links.map((link: any, index: number) => 
        prisma.link.update({
          where: { id: link.id },
          data: { createdAt: new Date(Date.now() + index) }
        })
      )
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering links:', error);
    return NextResponse.json({ error: 'Failed to reorder links' }, { status: 500 });
  }
} 