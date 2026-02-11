from datetime import date, timedelta
from typing import Dict, Any, List, Optional
from decimal import Decimal
from sqlmodel import Session, select
from app.contracts.models import ManagementContract
from app.reservations.models import Reservation, Payment
from app.finance.models import Expense
from app.properties.models import Property
from app.owners.models import Owner

class ReportingService:
    def __init__(self, session: Session):
        self.session = session

    def generate_owner_statement(self, property_id: str, start_date: date, end_date: date) -> Dict[str, Any]:
        """
        Generates the data structure for the owner statement for a specific period.
        """
        import uuid
        if isinstance(property_id, str):
            property_id_uuid = uuid.UUID(property_id)
        else:
             property_id_uuid = property_id
             
        # Month string for display, or custom range
        period_title = f"{start_date} - {end_date}"

        # 1. Find Active Contract
        contract = self._get_active_contract(property_id_uuid, start_date, end_date)
        if not contract:
            raise ValueError(f"No active contract found for property {property_id} covering {start_date} to {end_date}")

        # 2. Fetch Reservations ending in month
        reservations = self._get_reservations(property_id_uuid, start_date, end_date)

        # 3. Sum Payments (Gross Revenue)
        gross_revenue = Decimal(0)
        formatted_reservations = []
        
        # Load payments relationship eagerly if possible, or lazy load
        # For now relying on lazy load
        for res in reservations:
            # Payment logic: Gross Revenue = Sum of Net Amounts of payments linked to reservations ending in this month
            print(f"DEBUG: Processing Res {res.id}, Status: {repr(res.status)}")
            print(f"DEBUG: Payments count: {len(res.payments)}")
            for p in res.payments:
                 print(f"DEBUG: Pmt {p.id} Status: {repr(p.status)} Net: {p.net_amount} (Type: {type(p.net_amount)}) Amount: {p.amount}")
            
            # Debug sum no filter
            debug_sum = sum(p.net_amount for p in res.payments)
            print(f"DEBUG: Sum No Filter: {debug_sum}")
            
            res_total = sum(p.net_amount for p in res.payments if p.status == 'paid')
            print(f"DEBUG: Res Total: {res_total}")
            gross_revenue += res_total
            import sys
            sys.stdout.flush()
            
            formatted_reservations.append({
                "id": str(res.id),
                "guest": res.guest.full_name if res.guest else "Unknown",
                "check_in": res.start_date,
                "check_out": res.end_date,
                "gross_amount": res_total 
            })

        # 4. Fetch Expenses
        expenses = self._get_expenses(property_id_uuid, start_date, end_date)
        total_expenses = sum(e.amount for e in expenses if e.is_deductible)
        
        # 5. Calculate
        net_revenue = gross_revenue - total_expenses
        commission = net_revenue * contract.commission_rate
        payout = net_revenue - commission

        # Fetch Property and Owner details
        # Using session.get with UUID
        prop = self.session.get(Property, property_id_uuid)
        if not prop:
             raise ValueError("Property not found")
        owner = prop.owner
        if not owner:
             raise ValueError("Owner not found for property")

        return {
            "period": period_title,
            "period_start": start_date,
            "period_end": end_date,
            "property": {
                "name": prop.name,
                "address": prop.address
            },
            "owner": {
                "name": owner.full_name,
                "email": owner.email,
                "address": "" # Add if available
            },
            "financials": {
                "gross_revenue": gross_revenue,
                "total_expenses": total_expenses,
                "net_revenue": net_revenue,
                "commission_rate": contract.commission_rate,
                "commission": commission,
                "payout": payout
            },
            "reservations": formatted_reservations,
            "expenses": [{
                "date": e.date,
                "category": e.category,
                "description": e.description,
                "amount": e.amount,
                "is_deductible": e.is_deductible
            } for e in expenses]
        }

    def _get_active_contract(self, property_id, start, end) -> Optional[ManagementContract]:
        # Find contract active during the period. Using overlap logic.
        statement = select(ManagementContract).where(
            ManagementContract.property_id == property_id,
            ManagementContract.active == True
        )
        contracts = self.session.exec(statement).all()
        
        for c in contracts:
            c_end = c.end_date or date.max
            # Check overlap: start <= c_end AND end >= c_start
            if start <= c_end and end >= c.start_date:
                return c
        return None

    def _get_reservations(self, property_id, start, end) -> List[Reservation]:
        # Reservations ENDING in the specific month
        # Status should be completed or confirmed?
        # Only reservations that have actually happened (ended)
        statement = select(Reservation).where(
            Reservation.property_id == property_id,
            Reservation.end_date >= start,
            Reservation.end_date <= end,
            Reservation.status != "cancelled"
        )
        return self.session.exec(statement).all()

    def _get_expenses(self, property_id, start, end) -> List[Expense]:
        statement = select(Expense).where(
            Expense.property_id == property_id,
            Expense.date >= start,
            Expense.date <= end
        )
        return self.session.exec(statement).all()
