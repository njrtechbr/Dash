import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const showId = parseInt(params.id);
    
    // Prisma vai deletar os episódios automaticamente devido ao onDelete: Cascade
    await prisma.show.delete({
      where: { id: showId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting show:', error);
    return NextResponse.json({ error: 'Failed to delete show' }, { status: 500 });
  }
} 