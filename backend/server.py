from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


class SeatStatus(str, Enum):
    AVAILABLE = "available"
    SELECTED = "selected"
    BOOKED = "booked"


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User


class Movie(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    genre: str
    duration: int
    rating: float
    description: str
    poster_url: str
    backdrop_url: str
    release_date: str


class Showtime(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    movie_id: str
    theater_id: str
    theater_name: str
    start_time: str
    date: str
    price: float


class Seat(BaseModel):
    row: str
    number: int
    status: SeatStatus
    price: float


class TheaterSeats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    theater_id: str
    theater_name: str
    showtime_id: str
    seats: List[List[Seat]]


class BookingCreate(BaseModel):
    showtime_id: str
    seats: List[dict]
    total_amount: float


class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    showtime_id: str
    movie_title: str
    theater_name: str
    show_date: str
    show_time: str
    seats: List[dict]
    total_amount: float
    booking_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "confirmed"


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)


@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    
    user_doc = user.model_dump()
    user_doc["password"] = hashed_password
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user_doc = await db.users.find_one({"email": user_data.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user_data.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(
        id=user_doc["id"],
        email=user_doc["email"],
        name=user_doc["name"],
        created_at=datetime.fromisoformat(user_doc["created_at"]) if isinstance(user_doc["created_at"], str) else user_doc["created_at"]
    )
    
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@api_router.get("/movies", response_model=List[Movie])
async def get_movies():
    movies = await db.movies.find({}, {"_id": 0}).to_list(100)
    return movies


@api_router.get("/movies/{movie_id}", response_model=Movie)
async def get_movie(movie_id: str):
    movie = await db.movies.find_one({"id": movie_id}, {"_id": 0})
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@api_router.get("/movies/{movie_id}/showtimes", response_model=List[Showtime])
async def get_showtimes(movie_id: str):
    showtimes = await db.showtimes.find({"movie_id": movie_id}, {"_id": 0}).to_list(100)
    return showtimes


@api_router.get("/showtimes/{showtime_id}/seats", response_model=TheaterSeats)
async def get_seats(showtime_id: str):
    showtime = await db.showtimes.find_one({"id": showtime_id}, {"_id": 0})
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")
    
    booked_seats = await db.bookings.find({"showtime_id": showtime_id, "status": "confirmed"}, {"_id": 0, "seats": 1}).to_list(1000)
    booked_seat_ids = set()
    for booking in booked_seats:
        for seat in booking.get("seats", []):
            booked_seat_ids.add(f"{seat['row']}-{seat['number']}")
    
    rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    seats_per_row = 12
    seat_layout = []
    
    for row in rows:
        row_seats = []
        for num in range(1, seats_per_row + 1):
            seat_id = f"{row}-{num}"
            status = SeatStatus.BOOKED if seat_id in booked_seat_ids else SeatStatus.AVAILABLE
            
            if row in ['A', 'B']:
                price = showtime['price'] + 50
            elif row in ['C', 'D', 'E']:
                price = showtime['price']
            else:
                price = showtime['price'] - 30
            
            row_seats.append(Seat(
                row=row,
                number=num,
                status=status,
                price=price
            ))
        seat_layout.append(row_seats)
    
    return TheaterSeats(
        theater_id=showtime['theater_id'],
        theater_name=showtime['theater_name'],
        showtime_id=showtime_id,
        seats=seat_layout
    )


@api_router.post("/bookings", response_model=Booking)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user)
):
    showtime = await db.showtimes.find_one({"id": booking_data.showtime_id}, {"_id": 0})
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")
    
    movie = await db.movies.find_one({"id": showtime['movie_id']}, {"_id": 0})
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    for seat in booking_data.seats:
        seat_id = f"{seat['row']}-{seat['number']}"
        existing_booking = await db.bookings.find_one({
            "showtime_id": booking_data.showtime_id,
            "seats": {"$elemMatch": {"row": seat['row'], "number": seat['number']}},
            "status": "confirmed"
        })
        if existing_booking:
            raise HTTPException(status_code=400, detail=f"Seat {seat_id} is already booked")
    
    booking = Booking(
        user_id=current_user.id,
        showtime_id=booking_data.showtime_id,
        movie_title=movie['title'],
        theater_name=showtime['theater_name'],
        show_date=showtime['date'],
        show_time=showtime['start_time'],
        seats=booking_data.seats,
        total_amount=booking_data.total_amount
    )
    
    booking_doc = booking.model_dump()
    booking_doc['booking_date'] = booking_doc['booking_date'].isoformat()
    
    await db.bookings.insert_one(booking_doc)
    return booking


@api_router.get("/bookings", response_model=List[Booking])
async def get_user_bookings(current_user: User = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": current_user.id}, {"_id": 0}).sort("booking_date", -1).to_list(100)
    
    for booking in bookings:
        if isinstance(booking['booking_date'], str):
            booking['booking_date'] = datetime.fromisoformat(booking['booking_date'])
    
    return bookings


@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    booking = await db.bookings.find_one({"id": booking_id, "user_id": current_user.id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if isinstance(booking['booking_date'], str):
        booking['booking_date'] = datetime.fromisoformat(booking['booking_date'])
    
    return booking


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_db():
    movie_count = await db.movies.count_documents({})
    if movie_count == 0:
        movies_data = [
            {
                "id": "movie-1",
                "title": "Neon Cyberpunk",
                "genre": "Sci-Fi",
                "duration": 142,
                "rating": 8.7,
                "description": "In a dystopian future where technology rules all, a rogue hacker discovers the truth behind the system.",
                "poster_url": "https://images.pexels.com/photos/8108427/pexels-photo-8108427.jpeg",
                "backdrop_url": "https://images.pexels.com/photos/8108427/pexels-photo-8108427.jpeg",
                "release_date": "2024-03-15"
            },
            {
                "id": "movie-2",
                "title": "Warzone Alpha",
                "genre": "Action",
                "duration": 128,
                "rating": 8.2,
                "description": "An elite soldier must prevent a global catastrophe in this high-octane action thriller.",
                "poster_url": "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg",
                "backdrop_url": "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg",
                "release_date": "2024-04-20"
            },
            {
                "id": "movie-3",
                "title": "Midnight Rain",
                "genre": "Romance",
                "duration": 115,
                "rating": 7.9,
                "description": "Two souls find each other on a rainy night in Paris, beginning a love story that transcends time.",
                "poster_url": "https://images.pexels.com/photos/10071553/pexels-photo-10071553.jpeg",
                "backdrop_url": "https://images.pexels.com/photos/10071553/pexels-photo-10071553.jpeg",
                "release_date": "2024-02-14"
            },
            {
                "id": "movie-4",
                "title": "The Jester's Curse",
                "genre": "Horror",
                "duration": 105,
                "rating": 7.5,
                "description": "A cursed carnival comes to town, bringing terror and nightmares to a small community.",
                "poster_url": "https://images.pexels.com/photos/5427382/pexels-photo-5427382.jpeg",
                "backdrop_url": "https://images.pexels.com/photos/5427382/pexels-photo-5427382.jpeg",
                "release_date": "2024-10-31"
            },
            {
                "id": "movie-5",
                "title": "Space Odyssey",
                "genre": "Sci-Fi",
                "duration": 156,
                "rating": 9.1,
                "description": "A crew of astronauts embark on a journey to discover the origins of a mysterious signal from deep space.",
                "poster_url": "https://images.pexels.com/photos/12493995/pexels-photo-12493995.jpeg",
                "backdrop_url": "https://images.pexels.com/photos/12493995/pexels-photo-12493995.jpeg",
                "release_date": "2024-05-01"
            }
        ]
        await db.movies.insert_many(movies_data)
        logger.info("Seeded movies data")
        
        showtimes_data = []
        theaters = [
            {"id": "theater-1", "name": "CineLuxe IMAX"},
            {"id": "theater-2", "name": "Grand Cinema Hall"},
            {"id": "theater-3", "name": "Premium Theater 4DX"}
        ]
        times = ["10:00 AM", "01:30 PM", "04:45 PM", "07:30 PM", "10:15 PM"]
        dates = ["2024-12-20", "2024-12-21", "2024-12-22"]
        
        showtime_counter = 1
        for movie in movies_data:
            for date in dates:
                for time_slot in times[:3]:
                    theater = theaters[showtime_counter % 3]
                    showtimes_data.append({
                        "id": f"showtime-{showtime_counter}",
                        "movie_id": movie["id"],
                        "theater_id": theater["id"],
                        "theater_name": theater["name"],
                        "start_time": time_slot,
                        "date": date,
                        "price": 250.0
                    })
                    showtime_counter += 1
        
        await db.showtimes.insert_many(showtimes_data)
        logger.info("Seeded showtimes data")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()