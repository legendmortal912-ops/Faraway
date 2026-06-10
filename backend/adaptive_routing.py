from datetime import datetime, timedelta
from typing import List, Optional, Callable
from models import OrganPackage, RouteSegment
from routing_engine import RoutingEngine


class AdaptiveReroutingEngine:
    """
    Continuously evaluates active packages against their viability deadlines.
    When a delay pushes the projected ETA past the deadline (minus safety buffer),
    it recomputes and swaps to the next feasible route — automatically.
    """

    SAFETY_BUFFER_MINUTES = 45

    def __init__(self, routing: RoutingEngine):
        self.routing = routing
        self.active_packages: dict = {}
        self.reroute_log: List[dict] = []

    def register(self, package: OrganPackage):
        self.active_packages[package.id] = package

    def project_arrival(self, package: OrganPackage, delay_min: int = 0) -> datetime:
        if not package.route:
            return datetime.now()
        return package.route[-1].arrival_time + timedelta(minutes=delay_min)

    def reroute_needed(self, package: OrganPackage, delay_min: int = 0) -> bool:
        projected = self.project_arrival(package, delay_min)
        buffer = timedelta(minutes=self.SAFETY_BUFFER_MINUTES)
        return projected + buffer >= package.viability_deadline

    async def evaluate(
        self,
        package: OrganPackage,
        delay_min: int = 0,
        broadcast_fn: Optional[Callable] = None,
    ) -> dict:
        if not self.reroute_needed(package, delay_min):
            return {"reroute_needed": False, "package_id": package.id}

        # Current position: start of first remaining segment
        current_seg = next(
            (s for s in package.route if s.arrival_time > datetime.now()), package.route[-1]
        )
        current_loc = current_seg.from_location
        dest_loc = package.route[-1].to_location

        remaining_hours = max(
            0,
            (package.viability_deadline - datetime.now()).total_seconds() / 3600 - delay_min / 60,
        )

        new_segs, feasible, new_min = self.routing.compute_route(
            current_loc,
            dest_loc,
            datetime.now() + timedelta(minutes=delay_min),
            int(remaining_hours),
        )

        old_eta_min = int((self.project_arrival(package) - datetime.now()).total_seconds() / 60)

        result = {
            "reroute_needed": True,
            "package_id": package.id,
            "reason": f"Flight delay of {delay_min} minutes detected",
            "old_eta_minutes": old_eta_min,
            "new_feasible": feasible,
            "new_total_minutes": new_min,
            "viability_remaining_hours": round(remaining_hours, 1),
            "new_segments": [
                {
                    "mode": s.mode,
                    "from": s.from_name,
                    "to": s.to_name,
                    "duration_minutes": s.duration_minutes,
                    "from_location": s.from_location,
                    "to_location": s.to_location,
                }
                for s in new_segs
            ] if new_segs else [],
            "message": (
                f"✈️ Route recalculated. New ETA: {round(new_min / 60, 1)}h. "
                f"Viability remaining: {round(remaining_hours, 1)}h."
            ) if feasible else
            "⚠️ CRITICAL: No feasible route within viability window. Emergency protocol active.",
        }

        if new_segs and feasible:
            package.route = new_segs

        self.reroute_log.append({
            "package_id": package.id,
            "timestamp": datetime.now().isoformat(),
            "result": result,
        })

        if broadcast_fn:
            await broadcast_fn("ROUTE_RECALCULATED", result)

        return result

    def history(self, package_id: str) -> List[dict]:
        return [r for r in self.reroute_log if r["package_id"] == package_id]
