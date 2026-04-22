import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Star, Clock } from 'lucide-react';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API}/movies`);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="bebas text-6xl text-white uppercase tracking-widest mb-12" data-testid="movies-page-title">
          All Movies
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movies/${movie.id}`}
              className="group"
              data-testid={`movie-item-${movie.id}`}
            >
              <div className="relative overflow-hidden rounded-xl aspect-[2/3] movie-card-hover">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-amber-500 font-bold manrope">{movie.rating}/10</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="bebas text-2xl text-white uppercase tracking-wide">
                  {movie.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-slate-400 manrope">
                  <span className="px-3 py-1 bg-zinc-800/50 border border-white/10 rounded-full">
                    {movie.genre}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{movie.duration}m</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}