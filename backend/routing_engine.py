import math
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from models import RouteSegment


class RoutingEngine:
    """
    Time-dependent multi-modal routing: ground → air → ground.
    Finds the fastest feasible route within the organ's viability window.
    """

    AIRPORTS = {
        "CDG": ("Paris Charles de Gaulle",      49.0097,   2.5479),
        "BOM": ("Mumbai Chhatrapati Shivaji",   19.0896,  72.8656),
        "GRU": ("São Paulo Guarulhos",          -23.4356, -46.4731),
        "JFK": ("New York JFK",                 40.6413,  -73.7781),
        "LHR": ("London Heathrow",              51.4700,   -0.4543),
        "DXB": ("Dubai International",          25.2532,  55.3657),
        "SIN": ("Singapore Changi",              1.3644,  103.9915),
        "NRT": ("Tokyo Narita",                 35.7647,  140.3864),
        "SYD": ("Sydney Kingsford Smith",      -33.9461,  151.1772),
        "ORD": ("Chicago O'Hare",               41.9742,  -87.9073),
        "DEL": ("Indira Gandhi International",  28.5562,  77.1000),
    }

    FLIGHT_SPEED   = 900   # km/h — commercial jet
    AMBULANCE_SPEED = 60   # km/h — hospital ↔ airport

    def haversine(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Great-circle distance in km."""
        R = 6371
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi   = math.radians(lat2 - lat1)
        dlambda = math.radians(lng2 - lng1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return 2 * R * math.asin(math.sqrt(a))

    def find_nearest_airport(self, location: tuple) -> tuple:
        min_dist, nearest = float("inf"), None
        for code, (name, lat, lng) in self.AIRPORTS.items():
            d = self.haversine(location[0], location[1], lat, lng)
            if d < min_dist:
                min_dist, nearest = d, (code, name, lat, lng, d)
        return nearest

    def compute_route(
        self,
        donor_location: tuple,
        recipient_location: tuple,
        departure_time: datetime,
        viability_hours: int,
    ) -> Tuple[List[RouteSegment], bool, int]:
        """
        Returns (segments, is_feasible, total_minutes).
        Domestic routes (< 400 km) skip the air segment.
        """
        deadline = departure_time + timedelta(hours=viability_hours)
        direct_dist = self.haversine(
            donor_location[0], donor_location[1],
            recipient_location[0], recipient_location[1]
        )

        # ── Domestic ground-only route ─────────────────────────────────────────
        if direct_dist < 400:
            ground_minutes = int((direct_dist / self.AMBULANCE_SPEED) * 60) + 15
            arrival = departure_time + timedelta(minutes=ground_minutes)
            seg = RouteSegment(
                mode="ground",
                from_location=donor_location,
                to_location=recipient_location,
                from_name="Donor Hospital",
                to_name="Recipient Hospital",
                duration_minutes=ground_minutes,
                departure_time=departure_time,
                arrival_time=arrival,
            )
            return [seg], arrival < deadline, ground_minutes

        # ── International air route ────────────────────────────────────────────
        segments = []
        t = departure_time

        dep = self.find_nearest_airport(donor_location)
        dep_code, dep_name, dep_lat, dep_lng, dist_to_dep = dep
        g1_min = int((dist_to_dep / self.AMBULANCE_SPEED) * 60) + 30
        segments.append(RouteSegment(
            mode="ground",
            from_location=donor_location,
            to_location=(dep_lat, dep_lng),
            from_name="Donor Hospital",
            to_name=f"{dep_name} ({dep_code})",
            duration_minutes=g1_min,
            departure_time=t,
            arrival_time=t + timedelta(minutes=g1_min),
        ))
        t += timedelta(minutes=g1_min + 45)   # +45 min security/loading

        arr = self.find_nearest_airport(recipient_location)
        arr_code, arr_name, arr_lat, arr_lng, _ = arr
        flight_dist = self.haversine(dep_lat, dep_lng, arr_lat, arr_lng)
        flight_min  = int((flight_dist / self.FLIGHT_SPEED) * 60)
        segments.append(RouteSegment(
            mode="air",
            from_location=(dep_lat, dep_lng),
            to_location=(arr_lat, arr_lng),
            from_name=f"{dep_name} ({dep_code})",
            to_name=f"{arr_name} ({arr_code})",
            duration_minutes=flight_min,
            departure_time=t,
            arrival_time=t + timedelta(minutes=flight_min),
        ))
        t += timedelta(minutes=flight_min + 30)   # +30 customs/unload

        dist_to_hosp = self.haversine(arr_lat, arr_lng,
                                       recipient_location[0], recipient_location[1])
        g2_min = int((dist_to_hosp / self.AMBULANCE_SPEED) * 60)
        segments.append(RouteSegment(
            mode="ground",
            from_location=(arr_lat, arr_lng),
            to_location=recipient_location,
            from_name=f"{arr_name} ({arr_code})",
            to_name="Recipient Hospital",
            duration_minutes=g2_min,
            departure_time=t,
            arrival_time=t + timedelta(minutes=g2_min),
        ))
        t += timedelta(minutes=g2_min)

        total_min = int((t - departure_time).total_seconds() / 60)
        return segments, t < deadline, total_min
