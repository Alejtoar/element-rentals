"""
Finance Module Routers
API endpoints for PaymentMethod and Expense management
"""

import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db import get_session
from app.auth.dependencies import get_current_staff_user, get_current_finance_user
from app.users.models import User
from app.finance.schemas import (
    PaymentMethodCreate, PaymentMethodRead, PaymentMethodUpdate,
    ExpenseCreate, ExpenseRead, ExpenseUpdate
)
from app.finance.service import PaymentMethodService, ExpenseService


# PaymentMethod Router
payment_method_router = APIRouter(prefix="/payment-methods", tags=["payment-methods"])


@payment_method_router.get("/", response_model=List[PaymentMethodRead])
def list_payment_methods(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """
    List all payment methods.
    
    Query params:
    - active_only: Filter to show only active payment methods
    """
    service = PaymentMethodService(session)
    return service.get_payment_methods(skip=skip, limit=limit, active_only=active_only)


@payment_method_router.get("/{payment_method_id}", response_model=PaymentMethodRead)
def get_payment_method(
    payment_method_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Get a specific payment method by ID."""
    service = PaymentMethodService(session)
    return service.get_payment_method_by_id(payment_method_id)


@payment_method_router.post("/", response_model=PaymentMethodRead, status_code=status.HTTP_201_CREATED)
def create_payment_method(
    payment_method: PaymentMethodCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_finance_user)  # Finance/Admin only
):
    """
    Create a new payment method.
    
    Security: Only Finance and Admin roles can create payment methods.
    """
    service = PaymentMethodService(session)
    return service.create_payment_method(payment_method.dict())


@payment_method_router.patch("/{payment_method_id}", response_model=PaymentMethodRead)
def update_payment_method(
    payment_method_id: uuid.UUID,
    payment_method: PaymentMethodUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_finance_user)  # Finance/Admin only
):
    """
    Update a payment method.
    
    Security: Only Finance and Admin roles can update payment methods.
    """
    service = PaymentMethodService(session)
    return service.update_payment_method(payment_method_id, payment_method.dict(exclude_unset=True))


@payment_method_router.delete("/{payment_method_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment_method(
    payment_method_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_finance_user)  # Finance/Admin only
):
    """
    Delete a payment method.
    
    Security: Only Finance and Admin roles can delete payment methods.
    """
    service = PaymentMethodService(session)
    service.delete_payment_method(payment_method_id)
    return None


# Expense Router
expense_router = APIRouter(prefix="/expenses", tags=["expenses"])


@expense_router.get("/", response_model=List[ExpenseRead])
def list_expenses(
    skip: int = 0,
    limit: int = 100,
    property_id: Optional[uuid.UUID] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """
    List all expenses.
    
    Query params:
    - property_id: Filter expenses by property
    """
    service = ExpenseService(session)
    return service.get_expenses(skip=skip, limit=limit, property_id=property_id)


@expense_router.get("/{expense_id}", response_model=ExpenseRead)
def get_expense(
    expense_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)
):
    """Get a specific expense by ID."""
    service = ExpenseService(session)
    return service.get_expense_by_id(expense_id)


@expense_router.post("/", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_staff_user)  # Staff can create
):
    """
    Create a new expense.
    
    Security: Staff, Finance, and Admin roles can create expenses.
    """
    service = ExpenseService(session)
    return service.create_expense(expense.dict())


@expense_router.patch("/{expense_id}", response_model=ExpenseRead)
def update_expense(
    expense_id: uuid.UUID,
    expense: ExpenseUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_finance_user)  # Finance/Admin only
):
    """
    Update an expense.
    
    Security: Only Finance and Admin roles can update expenses.
    """
    service = ExpenseService(session)
    return service.update_expense(expense_id, expense.dict(exclude_unset=True))


@expense_router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_finance_user)  # Finance/Admin only
):
    """
    Delete an expense.
    
    Security: Only Finance and Admin roles can delete expenses.
    """
    service = ExpenseService(session)
    service.delete_expense(expense_id)
    return None

# Reporting Router
reporting_router = APIRouter(prefix="/reports", tags=["reports"])

@reporting_router.get("/statement")
def get_owner_statement(
    property_id: uuid.UUID,
    start_date: date,
    end_date: date,
    lang: str = "es",
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_finance_user) # Finance/Admin only
):
    """
    Generate Owner Statement PDF for a specific date range.
    
    Params:
    - property_id: ID of the property
    - start_date: Start of the period (YYYY-MM-DD)
    - end_date: End of the period (YYYY-MM-DD)
    - lang: "es" or "en" (default "es")
    """
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    from app.finance.reporting import ReportingService
    from app.utils.pdf_generator import create_owner_statement_pdf
    from fastapi.responses import Response

    service = ReportingService(session)
    try:
        data = service.generate_owner_statement(str(property_id), start_date, end_date)
        pdf_bytes = create_owner_statement_pdf(data, lang=lang)
        
        filename = f"statement_{start_date}_{end_date}_{property_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
