import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h1 className="bebas text-5xl text-white uppercase tracking-widest mb-12" data-testid="my-bookings-title">
          My Bookings
        </h1>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="glass rounded-2xl p-8 space-y-6"
                data-testid={`booking-${booking.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h2 className="bebas text-3xl text-white uppercase tracking-wide">
                      {booking.movie_title}
                    </h2>
                    <div className="flex items-center space-x-2 text-slate-400 manrope">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.theater_name}</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg">
                    <span className="text-green-500 font-semibold manrope uppercase text-sm">
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400 manrope text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Show Date</span>
                    </div>
                    <p className="text-white font-semibold manrope">
                      {new Date(booking.show_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400 manrope text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Show Time</span>
                    </div>
                    <p className="text-white font-semibold jetbrains">{booking.show_time}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400 manrope text-sm">
                      <Ticket className="w-4 h-4" />
                      <span>Seats</span>
                    </div>
                    <p className="text-white font-semibold jetbrains">
                      {booking.seats.map(s => `${s.row}${s.number}`).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-slate-400 manrope text-sm">Booking ID</p>
                    <p className="text-white jetbrains text-sm">{booking.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 manrope text-sm">Total Amount</p>
                    <p className="bebas text-3xl text-amber-500">₹{booking.total_amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-heavy rounded-2xl p-16 text-center space-y-4">
            <Ticket className="w-16 h-16 text-slate-600 mx-auto" />
            <h3 className="bebas text-2xl text-white uppercase tracking-wide">No Bookings Yet</h3>
            <p className="text-slate-400 manrope">Start booking your favorite movies!</p>
          </div>
        )}
      </div>
    </div>
  );
}