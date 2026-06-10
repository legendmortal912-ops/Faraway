import networkx as nx
from datetime import datetime, timedelta
import math
from typing import List, Tuple
from models import RouteSegment

class RoutingEngine:
    """
    Solves the time-dependent multi-modal routing problem.
    Finds the fastest ground+air+ground route within the organ's viability window.
    """
    
    # Major international airports with coordinates
    AIRPORTS = {
        "CDG": ("Paris Charles de Gaulle", 49.0097, 2.5479),
        "BOM": ("Mumbai Chhatrapati Shivaji", 19.0896, 72.8656),
        "GRU": ("São Paulo Guarulhos", -23.4356, -46.4731),
        "JFK": ("New York JFK", 40.6413, -73.7781),
        "LHR": ("London Heathrow", 51.4700, -0.4543),
        "DXB": ("Dubai International", 25.2532, 55.3657),
        "SIN": ("Singapore Changi", 1.3644, 103.9915),
        "NRT": ("Tokyo Narita", 35.7647, 140.3864),
        "SYD": ("Sydney Kingsford Smith", -33.9461, 151.1772),
        "ORD": ("Chicago O'Hare", 41.9742, -87.9073),
    }
    
    # Average flight speeds and ground transport speeds (km/h)
    FLIGHT_SPEED = 900      # commercial jet
    GROUND_SPEED = 80       # medical courier (city traffic)
    AMBULANCE_SPEED = 60    # hospital to airport
    
    def haversine(self, lat1, lng1, lat2, lng2) -> float:
        """Calculate great-circle distance in km."""
        R = 6371
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lng2 - lng1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
        return 2 * R * math.asin(math.sqrt(a))
    
    def find_nearest_airport(self, location: tuple) -> tuple:
        """Find the nearest airport to a given lat/lng."""
        min_dist = float('inf')
        nearest = None
        for code, (name, lat, lng) in self.AIRPORTS.items():
            dist = self.haversine(location[0], location[1], lat, lng)
            if dist < min_dist:
                min_dist = dist
                nearest = (code, name, lat, lng, dist)
        return nearest
    
    def compute_route(
        self,
        donor_location: tuple,
        recipient_location: tuple,
        departure_time: datetime,
        viability_hours: int
    ) -> Tuple[List[RouteSegment], bool, int]:
        """
        Compute optimal multi-modal route.
        Returns (route_segments, is_feasible, total_minutes).
        """
        deadline = departure_time + timedelta(hours=viability_hours)
        segments = []
        current_time = departure_time
        
        # Segment 1: Hospital to nearest departure airport (ambulance)
        dep_airport = self.find_nearest_airport(donor_location)
        dep_code, dep_name, dep_lat, dep_lng, dist_to_airport = dep_airport
        
        ground_1_minutes = int((dist_to_airport / self.AMBULANCE_SPEED) * 60) + 30  # +30 for prep
        segments.append(RouteSegment(
            mode="ground",
            from_location=donor_location,
            to_location=(dep_lat, dep_lng),
            from_name="Donor Hospital",
            to_name=f"{dep_name} ({dep_code})",
            duration_minutes=ground_1_minutes,
            departure_time=current_time,
            arrival_time=current_time + timedelta(minutes=ground_1_minutes)
        ))
        current_time += timedelta(minutes=ground_1_minutes)
        
        # Airport processing time
        current_time += timedelta(minutes=45)  # security + loading
        
        # Segment 2: Flight (departure airport → arrival airport nearest to recipient)
        arr_airport = self.find_nearest_airport(recipient_location)
        arr_code, arr_name, arr_lat, arr_lng, _ = arr_airport
        
        flight_dist = self.haversine(dep_lat, dep_lng, arr_lat, arr_lng)
        flight_minutes = int((flight_dist / self.FLIGHT_SPEED) * 60)
        
        segments.append(RouteSegment(
            mode="air",
            from_location=(dep_lat, dep_lng),
            to_location=(arr_lat, arr_lng),
            from_name=f"{dep_name} ({dep_code})",
            to_name=f"{arr_name} ({arr_code})",
            duration_minutes=flight_minutes,
            departure_time=current_time,
            arrival_time=current_time + timedelta(minutes=flight_minutes)
        ))
        current_time += timedelta(minutes=flight_minutes)
        
        # Customs + unloading
        current_time += timedelta(minutes=30)
        
        # Segment 3: Arrival airport to recipient hospital (ambulance)
        dist_to_hospital = self.haversine(arr_lat, arr_lng, 
                                          recipient_location[0], recipient_location[1])
        ground_2_minutes = int((dist_to_hospital / self.AMBULANCE_SPEED) * 60)
        
        segments.append(RouteSegment(
            mode="ground",
            from_location=(arr_lat, arr_lng),
            to_location=recipient_location,
            from_name=f"{arr_name} ({arr_code})",
            to_name="Recipient Hospital",
            duration_minutes=ground_2_minutes,
            departure_time=current_time,
            arrival_time=current_time + timedelta(minutes=ground_2_minutes)
        ))
        current_time += timedelta(minutes=ground_2_minutes)
        
        total_minutes = int((current_time - departure_time).total_seconds() / 60)
        is_feasible = current_time < deadline
        
        return segments, is_feasible, total_minutes
