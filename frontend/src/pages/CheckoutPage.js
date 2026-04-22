import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { CreditCard, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showtimeId, seats, totalAmount, theaterName } = location.state || {};
  
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  if (!showtimeId || !seats) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
      toast.error('Please fill all payment details');
      return;
    }

    setProcessing(true);

    setTimeout(async () => {
      try {
        const bookingData = {
          showtime_id: showtimeId,
          seats: seats.map(s => ({ row: s.row, number: s.number, price: s.price })),
          total_amount: totalAmount
        };

        const response = await axios.post(`${API}/bookings`, bookingData);
        
        setPaymentSuccess(true);
        toast.success('Payment successful! Booking confirmed');
        
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1500);
      } catch (error) {
        console.error('Booking error:', error);
        toast.error(error.response?.data?.detail || 'Booking failed. Please try again.');
        setProcessing(false);
      }
    }, 1500);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 animate-slide-up">
          <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="bebas text-4xl text-white uppercase tracking-widest">Booking Confirmed!</h2>
          <p className="text-slate-400 manrope">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <h1 className="bebas text-5xl text-white uppercase tracking-widest mb-12" data-testid="checkout-title">
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-heavy rounded-2xl p-8 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-green-500" />
              <h2 className="bebas text-2xl text-white uppercase tracking-wide">Secure Payment</h2>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-slate-300 manrope font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all jetbrains"
                  data-testid="card-number-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 manrope font-medium mb-2">Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  value={cardDetails.cardName}
                  onChange={handleInputChange}
                  placeholder="JOHN DOE"
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all uppercase"
                  data-testid="card-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 manrope font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all jetbrains"
                    data-testid="expiry-date-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 manrope font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="3"
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all jetbrains"
                    data-testid="cvv-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="pay-now-btn"
              >
                <CreditCard className="w-5 h-5" />
                <span>{processing ? 'Processing...' : `Pay ₹${totalAmount}`}</span>
              </button>
            </form>

            <p className="text-xs text-slate-500 manrope text-center">
              This is a demo payment. No real transaction will be processed.
            </p>
          </div>

          <div className="glass-heavy rounded-2xl p-8 space-y-6">
            <h2 className="bebas text-2xl text-white uppercase tracking-wide">Booking Details</h2>
            
            <div className="space-y-4 text-slate-300 manrope">
              <div className="flex justify-between pb-3 border-b border-white/10">
                <span>Theater:</span>
                <span className="font-semibold text-white">{theaterName}</span>
              </div>
              
              <div className="flex justify-between pb-3 border-b border-white/10">
                <span>Selected Seats:</span>
                <span className="font-semibold text-white jetbrains" data-testid="checkout-seats">
                  {seats.map(s => `${s.row}${s.number}`).join(', ')}
                </span>
              </div>
              
              <div className="flex justify-between pb-3 border-b border-white/10">
                <span>Number of Tickets:</span>
                <span className="font-semibold text-white">{seats.length}</span>
              </div>

              <div className="space-y-2 pt-4">
                {seats.map((seat, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>Seat {seat.row}{seat.number}</span>
                    <span>₹{seat.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10 text-white">
                <span className="bebas text-xl uppercase">Total Amount:</span>
                <span className="bebas text-3xl text-amber-500" data-testid="checkout-total">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}