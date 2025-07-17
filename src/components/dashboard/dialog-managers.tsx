
'use client';

import * as React from 'react';
import { useShows } from '@/hooks/use-shows';
import { useMovies } from '@/hooks/use-movies';

// Lazy load components to avoid circular dependencies
const ShowDetailsDialog = React.lazy(() => 
  import('@/components/dashboard/show-details-dialog').then(mod => ({ 
    default: mod.ShowDetailsDialog 
  }))
);

const MovieDetailsDialog = React.lazy(() => 
  import('@/components/dashboard/movie-details-dialog').then(mod => ({ 
    default: mod.MovieDetailsDialog 
  }))
);

// This component can be placed in your layout to handle dialogs globally
export function DialogManagers() {
    const { isShowDetailsOpen, setShowDetailsOpen, showDetailsId } = useShows();
    const { isMovieDetailsOpen, setMovieDetailsOpen, movieDetailsId } = useMovies();

    return (
        <>
            {showDetailsId && isShowDetailsOpen && (
                <React.Suspense fallback={null}>
                    <ShowDetailsDialog
                        open={isShowDetailsOpen}
                        onOpenChange={setShowDetailsOpen}
                        showId={showDetailsId}
                    />
                </React.Suspense>
            )}
            {movieDetailsId && isMovieDetailsOpen && (
                <React.Suspense fallback={null}>
                    <MovieDetailsDialog
                        open={isMovieDetailsOpen}
                        onOpenChange={setMovieDetailsOpen}
                        movieId={movieDetailsId}
                    />
                </React.Suspense>
            )}
        </>
    );
}
