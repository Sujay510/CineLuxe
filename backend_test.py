#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CineLuxeAPITester:
    def __init__(self, base_url="https://seat-preview.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json().get('detail', '')
                    if error_detail:
                        error_msg += f" - {error_detail}"
                except:
                    pass
                self.log_test(name, False, error_msg)
                return None

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return None

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.test_email = test_user_data['email']
            self.test_password = test_user_data['password']
            return True
        return False

    def test_user_login(self):
        """Test user login with registered credentials"""
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No registered user to test login")
            return False
            
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return response is not None

    def test_get_movies(self):
        """Test getting all movies"""
        response = self.run_test(
            "Get All Movies",
            "GET",
            "movies",
            200
        )
        
        if response and isinstance(response, list) and len(response) > 0:
            self.test_movie_id = response[0]['id']
            return True
        return False

    def test_get_movie_details(self):
        """Test getting specific movie details"""
        if not hasattr(self, 'test_movie_id'):
            self.log_test("Get Movie Details", False, "No movie ID available")
            return False
            
        response = self.run_test(
            "Get Movie Details",
            "GET",
            f"movies/{self.test_movie_id}",
            200
        )
        return response is not None

    def test_get_showtimes(self):
        """Test getting showtimes for a movie"""
        if not hasattr(self, 'test_movie_id'):
            self.log_test("Get Movie Showtimes", False, "No movie ID available")
            return False
            
        response = self.run_test(
            "Get Movie Showtimes",
            "GET",
            f"movies/{self.test_movie_id}/showtimes",
            200
        )
        
        if response and isinstance(response, list) and len(response) > 0:
            self.test_showtime_id = response[0]['id']
            return True
        return False

    def test_get_seats(self):
        """Test getting seats for a showtime"""
        if not hasattr(self, 'test_showtime_id'):
            self.log_test("Get Showtime Seats", False, "No showtime ID available")
            return False
            
        response = self.run_test(
            "Get Showtime Seats",
            "GET",
            f"showtimes/{self.test_showtime_id}/seats",
            200
        )
        
        if response and 'seats' in response:
            # Find available seats for booking test
            self.available_seats = []
            for row in response['seats']:
                for seat in row:
                    if seat['status'] == 'available' and len(self.available_seats) < 2:
                        self.available_seats.append({
                            'row': seat['row'],
                            'number': seat['number'],
                            'price': seat['price']
                        })
            return True
        return False

    def test_create_booking(self):
        """Test creating a booking"""
        if not hasattr(self, 'available_seats') or len(self.available_seats) == 0:
            self.log_test("Create Booking", False, "No available seats found")
            return False
            
        booking_data = {
            "showtime_id": self.test_showtime_id,
            "seats": self.available_seats,
            "total_amount": sum(seat['price'] for seat in self.available_seats)
        }
        
        response = self.run_test(
            "Create Booking",
            "POST",
            "bookings",
            200,
            data=booking_data
        )
        
        if response and 'id' in response:
            self.test_booking_id = response['id']
            return True
        return False

    def test_get_user_bookings(self):
        """Test getting user's bookings"""
        response = self.run_test(
            "Get User Bookings",
            "GET",
            "bookings",
            200
        )
        return response is not None

    def test_get_specific_booking(self):
        """Test getting a specific booking"""
        if not hasattr(self, 'test_booking_id'):
            self.log_test("Get Specific Booking", False, "No booking ID available")
            return False
            
        response = self.run_test(
            "Get Specific Booking",
            "GET",
            f"bookings/{self.test_booking_id}",
            200
        )
        return response is not None

    def test_invalid_endpoints(self):
        """Test error handling for invalid endpoints"""
        # Test non-existent movie
        self.run_test(
            "Invalid Movie ID (404)",
            "GET",
            "movies/invalid-movie-id",
            404
        )
        
        # Test non-existent showtime
        self.run_test(
            "Invalid Showtime ID (404)",
            "GET",
            "showtimes/invalid-showtime-id/seats",
            404
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🎬 Starting CineLuxe API Tests...")
        print("=" * 50)
        
        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
            
        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False
            
        self.test_get_current_user()
        
        # Movie and showtime tests
        if not self.test_get_movies():
            print("❌ Movies API failed, stopping tests")
            return False
            
        self.test_get_movie_details()
        
        if not self.test_get_showtimes():
            print("❌ Showtimes API failed, stopping tests")
            return False
            
        # Seat and booking tests
        if not self.test_get_seats():
            print("❌ Seats API failed, stopping tests")
            return False
            
        self.test_create_booking()
        self.test_get_user_bookings()
        self.test_get_specific_booking()
        
        # Error handling tests
        self.test_invalid_endpoints()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    tester = CineLuxeAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())