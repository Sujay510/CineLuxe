# CineLuxe - Movie Ticket Booking App

An AI based full-stack movie ticket booking application built with FastAPI (Python) and React.

## Features

- Browse movies and showtimes
- Select seats with dynamic pricing
- User authentication (JWT-based)
- Booking management
- Responsive UI with shadcn/ui components

## Tech Stack

- **Backend**: FastAPI + Motor (MongoDB async driver)
- **Frontend**: React + React Router + Tailwind CSS + shadcn/ui
- **Database**: MongoDB
- **Authentication**: JWT tokens with bcrypt

## Running Locally

### Prerequisites

1. **Python 3.8+**
2. **Node.js 16+** with Yarn
3. **MongoDB** running locally (or use Docker)

### Option 1: Quick Start (macOS)

Run the startup script:

```bash
chmod +x start-local.sh
./start-local.sh
```

This will:
1. Check if MongoDB is running
2. Start the backend on http://localhost:8000
3. Start the frontend on http://localhost:3000

### Option 2: Manual Setup

#### Step 1: Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 mongo
```

#### Step 2: Start the Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000

API documentation at: http://localhost:8000/docs

#### Step 3: Start the Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies
yarn install

# Start the development server
yarn start
```

The frontend will be available at: http://localhost:3000

### Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
MONGO_URL=mongodb://localhost:27017
CORS_ORIGINS=http://localhost:3000
JWT_SECRET_KEY=your-secret-key-here
```

#### Frontend Environment Variables

The `.env` file in `frontend/` should contain:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login existing user |
| GET | /api/auth/me | Get current user |
| GET | /api/movies | List all movies |
| GET | /api/movies/{id} | Get movie details |
| GET | /api/movies/{id}/showtimes | Get movie showtimes |
| GET | /api/showtimes/{id}/seats | Get seat layout |
| POST | /api/bookings | Create a booking |
| GET | /api/bookings | Get user bookings |

## Default Data

The backend automatically seeds sample data on startup if the database is empty:
- 5 movies with posters from Pexels
- Showtimes across 3 theaters
- Sample seat layouts

## Deployment

This app was originally built with emergent.ai but can be deployed anywhere:

1. **Backend**: Use any ASGI server (Uvicorn, Gunicorn)
2. **Frontend**: Build with `yarn build` and serve the static files
3. **Database**: MongoDB Atlas or self-hosted MongoDB

## License

MIT
