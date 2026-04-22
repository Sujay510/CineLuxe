import React from 'react';
import { Eye } from 'lucide-react';

export default function SeatPreview({ seat, totalRows }) {
  if (!seat) {
    return (
      <div className="glass-heavy rounded-2xl p-6 h-80 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Eye className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 manrope">Hover over a seat to preview the view</p>
        </div>
      </div>
    );
  }

  const rowIndex = seat.row.charCodeAt(0) - 65;
  const centerCol = 6;
  const rotateY = (seat.number - centerCol) * 2;
  const scale = 1 - (rowIndex * 0.04);
  const brightness = 1 + (rowIndex * 0.05);

  let viewQuality = 'Excellent View';
  let viewColor = 'text-green-500';
  
  if (rowIndex <= 1) {
    viewQuality = 'Front Row - Close View';
    viewColor = 'text-blue-500';
  } else if (rowIndex >= 6) {
    viewQuality = 'Back Row - Distant View';
    viewColor = 'text-amber-500';
  }

  return (
    <div className="glass-heavy rounded-2xl p-6 space-y-4" data-testid="seat-preview-container">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="bebas text-2xl text-white uppercase tracking-wide">Seat Preview</h3>
          <p className="text-slate-400 manrope text-sm jetbrains">Seat {seat.row}{seat.number}</p>
        </div>
        <div className="text-right">
          <p className={`font-semibold manrope ${viewColor}`} data-testid="view-quality">{viewQuality}</p>
          <p className="text-amber-500 font-bold manrope">₹{seat.price}</p>
        </div>
      </div>

      <div className="seat-preview-container overflow-hidden rounded-lg">
        <div className="relative h-48 overflow-hidden rounded-lg border border-white/10">
          <img
            src="https://images.pexels.com/photos/3709371/pexels-photo-3709371.jpeg"
            alt="Theater screen view"
            className="w-full h-full object-cover transition-all duration-500"
            style={{
              transform: `perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`,
              filter: `brightness(${brightness})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>

      <div className="space-y-2 text-sm manrope text-slate-300">
        <div className="flex justify-between">
          <span>Distance:</span>
          <span className="font-semibold">
            {rowIndex <= 1 ? 'Very Close' : rowIndex <= 4 ? 'Optimal' : 'Far'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Viewing Angle:</span>
          <span className="font-semibold">
            {Math.abs(seat.number - centerCol) <= 2 ? 'Center' : 'Side'}
          </span>
        </div>
      </div>
    </div>
  );
}