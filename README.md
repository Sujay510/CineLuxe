# CineLuxe 🎬

A full-stack movie ticket booking web application with a physics-informed seat preview engine.

---

## Highlight Feature: Geometric Seat Preview

Most booking apps show you a flat seat map. CineLuxe shows you what the screen actually looks like from your seat before you book.

The preview applies three CSS 3D transforms, each physically motivated:

**Viewing Angle (`rotateY`)**  computed using `atan2(seatOffset, rowDistance)` rather than a linear approximation. Horizontal seat offset from center is calculated in meters (assuming 0.5m seat width, center column at 14), and row distance from the screen grows by 1m per row starting at 4m for the front row.

```js
const seatOffset = (seat.number - centerCol) * 0.5;   // meters
const rowDistance = 4 + rowIndex;                       // meters
const rotateY = Math.atan2(seatOffset, rowDistance) * (180 / Math.PI);
```

**Perceived Scale (`scale`)**  screen appears smaller as distance increases, modeled as a linear falloff of 4% per row.

**Brightness (`brightness`)**  closer seats receive more light; brightness decreases with distance.

All assumptions (seat width, row pitch, initial screen distance) are based on average multiplex theater dimensions and are documented inline in `SeatPreview.jsx`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | FastAPI (async) |
| Database | MongoDB via Motor (async driver) |
| Auth | JWT (HS256) + bcrypt |
| ODM | Pydantic v2 |

---

## Features

- **Movie browsing** : catalog with genre, rating, duration, and poster
- **Showtime selection** : multiple theaters and time slots per movie
- **Seat booking** : interactive seat map with real-time availability from MongoDB
- **Dynamic pricing** : Last row is consits of premium recliner seats with a small increase in price compared to other rows.
- **Geometric seat preview** : trigonometric view simulation per seat (see above)
- **User auth** : register, login, JWT-protected routes, 7-day token expiry
- **Booking history** : per-user booking records with full show details

---

## Running Locally

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=cineluxe
JWT_SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

```bash
uvicorn server:app --reload --port 8000
```

The backend seeds movies and showtimes automatically on first startup.

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`. API calls proxy to `http://localhost:8000`.

---

## API Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/movies` | No | List all movies |
| GET | `/api/movies/{id}` | No | Get movie by ID |
| GET | `/api/movies/{id}/showtimes` | No | Get showtimes for movie |
| GET | `/api/showtimes/{id}/seats` | No | Get seat layout with availability |
| POST | `/api/bookings` | Yes | Create booking |
| GET | `/api/bookings` | Yes | Get user's bookings |
| GET | `/api/bookings/{id}` | Yes | Get specific booking |

---

## Project Structure

```
CineLuxe/
├── backend/
│   └── server.py          # FastAPI app, routes, DB models
├── frontend/
│   └── src/
│       ├── App.js          # Routing and pages
│       └── components/
│           └── SeatPreview.jsx   # Geometric seat preview engine
```

---

## Known Limitations

- Seat layout is generated dynamically (8 rows × 12 seats) rather than stored per-theater in the DB — a real system would store custom layouts
- Payment flow is UI-only; no payment gateway is integrated
- Seat preview uses a representative theater image with transform-based simulation rather than per-theater photography
