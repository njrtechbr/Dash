
'use client';

import * as React from 'react';
import { useShows } from '@/hooks/use-shows';
import { useMovies } from '@/hooks/use-movies';

// This component can be placed in your layout to handle dialogs globally
export function DialogManagers() {
    const { isShowDetailsOpen, setShowDetailsOpen, showDetailsId } = useShows();
    const { isMovieDetailsOpen, setMovieDetailsOpen, movieDetailsId } = useMovies();

    // Using dynamic import to avoid circular dependency issues at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ShowDetailsDialog = require('@/components/dashboard/show-details-dialog').ShowDetailsDialog;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MovieDetailsDialog = require('@/components/dashboard/movie-details-dialog').MovieDetailsDialog;

    return (
        <>
            {showDetailsId && (
                <ShowDetailsDialog
                open={isShowDetailsOpen}
                onOpenChange={setShowDetailsOpen}
                showId={showDetailsId}
                />
            )}
            {movieDetailsId && (
                <MovieDetailsDialog
                open={isMovieDetailsOpen}
                onOpenChange={setMovieDetailsOpen}
                movieId={movieDetailsId}
                />
            )}
        </>
    );
}
