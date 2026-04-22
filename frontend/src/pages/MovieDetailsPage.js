import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Star, Clock, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchMovieDetails();
    fetchShowtimes();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get(`${API}/movies/${id}`);
      setMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast.error('Failed to load movie details');
    }
  };

  const fetchShowtimes = async () => {
    try {
      const response = await axios.get(`${API}/movies/${id}/showtimes`);
      setShowtimes(response.data);
      if (response.data.length > 0) {
        setSelectedDate(response.data[0].date);
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowtimeSelect = (showtimeId) => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate('/auth');
      return;
    }
    navigate(`/select-seats/${showtimeId}`);
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const uniqueDates = [...new Set(showtimes.map(s => s.date))];
  const filteredShowtimes = showtimes.filter(s => s.date === selectedDate);

  return (
    <div className="min-h-screen">
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={movie.backdrop_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 h-full flex items-end pb-12">
          <div className="flex items-end space-x-8">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-64 rounded-xl shadow-2xl hidden md:block"
            />
            
            <div className="space-y-4 pb-4">
              <h1 className="bebas text-6xl text-white uppercase tracking-widest" data-testid="movie-detail-title">
                {movie.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-slate-300 manrope">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold" data-testid="movie-detail-rating">{movie.rating}/10</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span data-testid="movie-detail-duration">{movie.duration} min</span>
                </div>
                <span className="px-4 py-1.5 bg-red-600/20 border border-red-600/40 rounded-full">
                  {movie.genre}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="mb-12">
          <h2 className="bebas text-3xl text-white uppercase tracking-widest mb-4">Synopsis</h2>
          <p className="text-slate-300 text-lg manrope leading-relaxed max-w-4xl">
            {movie.description}
          </p>
        </div>

        <div>
          <h2 className="bebas text-4xl text-white uppercase tracking-widest mb-8" data-testid="select-showtime-title">
            Select Showtime
          </h2>

          <div className="space-y-8">
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-6 py-3 rounded-lg font-semibold manrope transition-all whitespace-nowrap ${
                    selectedDate === date
                      ? 'bg-red-600 text-white glow-red'
                      : 'bg-zinc-800/50 text-slate-300 border border-white/10 hover:bg-zinc-800'
                  }`}
                  data-testid={`date-select-${date}`}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </button>
              ))}
            </div>

            {filteredShowtimes.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(
                  filteredShowtimes.reduce((acc, showtime) => {
                    if (!acc[showtime.theater_name]) {
                      acc[showtime.theater_name] = [];
                    }
                    acc[showtime.theater_name].push(showtime);
                    return acc;
                  }, {})
                ).map(([theaterName, times]) => (
                  <div key={theaterName} className="glass rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-white">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      <h3 className="bebas text-2xl uppercase tracking-wide">{theaterName}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {times.map((showtime) => (
                        <button
                          key={showtime.id}
                          onClick={() => handleShowtimeSelect(showtime.id)}
                          className="px-6 py-3 bg-zinc-900/60 border border-white/10 rounded-lg text-white manrope font-medium hover:bg-red-600 hover:border-red-600 transition-all hover:glow-red"
                          data-testid={`showtime-${showtime.id}`}
                        >
                          <div className="jetbrains text-lg">{showtime.start_time}</div>
                          <div className="text-xs text-slate-400 mt-1">₹{showtime.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 manrope">
                No showtimes available for this date
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}