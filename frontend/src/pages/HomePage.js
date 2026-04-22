import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Play, Star, Clock } from 'lucide-react';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API}/movies`);
      setMovies(response.data.slice(0, 5));
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

  const featuredMovie = movies[0];

  return (
    <div className="min-h-screen">
      {featuredMovie && (
        <div className="relative h-[80vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredMovie.backdrop_url}
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 md:px-12 h-full flex items-end pb-20">
            <div className="max-w-2xl space-y-6 animate-slide-up">
              <h1 className="bebas text-6xl md:text-8xl text-white uppercase tracking-widest" data-testid="hero-movie-title">
                {featuredMovie.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-slate-300 manrope">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{featuredMovie.rating}/10</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{featuredMovie.duration} min</span>
                </div>
                <span className="px-3 py-1 bg-red-600/20 border border-red-600/40 rounded-full text-sm">
                  {featuredMovie.genre}
                </span>
              </div>

              <p className="text-slate-300 text-lg manrope leading-relaxed">
                {featuredMovie.description}
              </p>

              <div className="flex items-center space-x-4">
                <Link 
                  to={`/movies/${featuredMovie.id}`} 
                  className="btn-primary flex items-center space-x-2"
                  data-testid="hero-book-now-btn"
                >
                  <Play className="w-5 h-5" />
                  <span>Book Now</span>
                </Link>
                <Link 
                  to="/movies" 
                  className="btn-secondary"
                  data-testid="hero-view-all-btn"
                >
                  View All Movies
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="bebas text-5xl text-white uppercase tracking-widest mb-12" data-testid="now-showing-title">
          Now Showing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.slice(1).map((movie) => (
            <Link
              key={movie.id}
              to={`/movies/${movie.id}`}
              className="group relative overflow-hidden rounded-xl aspect-[2/3] movie-card-hover"
              data-testid={`movie-card-${movie.id}`}
            >
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                <h3 className="bebas text-2xl text-white uppercase tracking-wide">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-500 font-semibold manrope flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{movie.rating}</span>
                  </span>
                  <span className="text-slate-400 manrope">{movie.genre}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}