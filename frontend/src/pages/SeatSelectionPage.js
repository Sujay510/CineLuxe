import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import SeatPreview from '@/components/SeatPreview';

export default function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [theaterData, setTheaterData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, [showtimeId]);

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`${API}/showtimes/${showtimeId}/seats`);
      setTheaterData(response.data);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Failed to load seat information');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') return;

    const seatId = `${seat.row}-${seat.number}`;
    const isSelected = selectedSeats.some(s => `${s.row}-${s.number}` === seatId);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => `${s.row}-${s.number}` !== seatId));
    } else {
      if (selectedSeats.length >= 10) {
        toast.error('Maximum 10 seats can be selected');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getTotalAmount = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    navigate('/checkout', {
      state: {
        showtimeId,
        seats: selectedSeats,
        totalAmount: getTotalAmount(),
        theaterName: theaterData.theater_name
      }
    });
  };

  if (loading || !theaterData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading seats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8"
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="manrope font-medium">Back</span>
        </button>

        <h1 className="bebas text-5xl text-white uppercase tracking-widest mb-2" data-testid="theater-name">
          {theaterData.theater_name}
        </h1>
        <p className="text-slate-400 manrope mb-12">Select your preferred seats</p>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-heavy rounded-2xl p-8">
              <div className="mb-8">
                <div className="h-2 bg-gradient-to-b from-zinc-400 to-zinc-700 rounded-t-full mb-2 mx-auto" style={{ width: '80%' }} />
                <p className="text-center text-slate-400 manrope text-sm">SCREEN</p>
              </div>

              <div className="space-y-3">
                {theaterData.seats.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center justify-center space-x-2">
                    <span className="w-8 text-slate-400 manrope font-bold text-sm" data-testid={`row-label-${row[0].row}`}>
                      {row[0].row}
                    </span>
                    <div className="flex space-x-2">
                      {row.map((seat, seatIndex) => {
                        const seatId = `${seat.row}-${seat.number}`;
                        const isSelected = selectedSeats.some(s => `${s.row}-${s.number}` === seatId);
                        const isHovered = hoveredSeat && `${hoveredSeat.row}-${hoveredSeat.number}` === seatId;

                        return (
                          <button
                            key={seatIndex}
                            onClick={() => handleSeatClick(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            disabled={seat.status === 'booked'}
                            className={`seat w-10 h-10 rounded-lg font-bold text-xs jetbrains ${
                              seat.status === 'booked'
                                ? 'booked'
                                : isSelected
                                ? 'selected'
                                : 'available'
                            } ${isHovered && seat.status !== 'booked' ? 'ring-2 ring-amber-500' : ''}`}
                            data-testid={`seat-${seatId}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center space-x-8 text-sm manrope">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded seat available" />
                  <span className="text-slate-400">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded seat selected" />
                  <span className="text-slate-400">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded seat booked" />
                  <span className="text-slate-400">Booked</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SeatPreview seat={hoveredSeat || (selectedSeats.length > 0 ? selectedSeats[0] : null)} totalRows={theaterData.seats.length} />

            <div className="glass-heavy rounded-2xl p-6 space-y-6">
              <h3 className="bebas text-2xl text-white uppercase tracking-wide">Booking Summary</h3>
              
              {selectedSeats.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-300 manrope">
                      <span>Selected Seats:</span>
                      <span className="font-semibold jetbrains" data-testid="selected-seats-count">
                        {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 manrope">
                      <span>Total Seats:</span>
                      <span className="font-semibold">{selectedSeats.length}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between text-white">
                      <span className="bebas text-xl uppercase">Total Amount:</span>
                      <span className="bebas text-2xl text-amber-500" data-testid="total-amount">₹{getTotalAmount()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full btn-primary"
                    data-testid="proceed-checkout-btn"
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <p className="text-slate-400 manrope text-center py-8">
                  Select seats to view booking summary
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}