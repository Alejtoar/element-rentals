"""
Finance Module Service
Business logic for PaymentMethod and Expense, including fee calculations
"""

import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session

from app.finance.models import PaymentMethod, Expense
from app.finance.repository import PaymentMethodRepository, ExpenseRepository


class PaymentMethodService:
    def __init__(self, session: Session):
        self.repository = PaymentMethodRepository(session)
    
    def get_payment_method_by_id(self, payment_method_id: uuid.UUID) -> Optional[PaymentMethod]:
        payment_method = self.repository.get_by_id(payment_method_id)
        if not payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        return payment_method
    
    def get_payment_methods(self, skip: int = 0, limit: int = 100, active_only: bool = False) -> List[PaymentMethod]:
        return self.repository.get_all(skip=skip, limit=limit, active_only=active_only)
    
    def create_payment_method(self, payment_method_data: dict) -> PaymentMethod:
        payment_method = PaymentMethod(**payment_method_data)
        return self.repository.create(payment_method)
    
    def update_payment_method(self, payment_method_id: uuid.UUID, data: dict) -> Optional[PaymentMethod]:
        payment_method = self.repository.update(payment_method_id, data)
        if not payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        return payment_method
    
    def delete_payment_method(self, payment_method_id: uuid.UUID) -> bool:
        payment_method = self.get_payment_method_by_id(payment_method_id)
        return self.repository.delete(payment_method)
    
    @staticmethod
    def calculate_net_amount(amount: Decimal, payment_method: Optional[PaymentMethod]) -> Decimal:
        """
        Calculate net amount after payment processing fees.
        
        Formula: net_amount = amount - (amount * fee_percent / 100) - fee_fixed
        
        Args:
            amount: Gross payment amount
            payment_method: PaymentMethod with fee structure
        
        Returns:
            Net amount after fees
        """
        if not payment_method:
            return amount
        
        # Calculate percentage fee
        percent_fee = (amount * payment_method.transaction_fee_percent) / Decimal("100")
        
        # Calculate total fees
        total_fees = percent_fee + payment_method.transaction_fee_fixed
        
        # Calculate net amount
        net_amount = amount - total_fees
        
        # Ensure net amount is not negative
        if net_amount < Decimal("0"):
            net_amount = Decimal("0")
        
        return net_amount.quantize(Decimal("0.01"))


class ExpenseService:
    def __init__(self, session: Session):
        self.repository = ExpenseRepository(session)
    
    def get_expense_by_id(self, expense_id: uuid.UUID) -> Optional[Expense]:
        expense = self.repository.get_by_id(expense_id)
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        return expense
    
    def get_expenses(self, skip: int = 0, limit: int = 100, property_id: Optional[uuid.UUID] = None) -> List[Expense]:
        return self.repository.get_all(skip=skip, limit=limit, property_id=property_id)
    
    def create_expense(self, expense_data: dict) -> Expense:
        expense = Expense(**expense_data)
        return self.repository.create(expense)
    
    def update_expense(self, expense_id: uuid.UUID, data: dict) -> Optional[Expense]:
        expense = self.repository.update(expense_id, data)
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        return expense
    
    def delete_expense(self, expense_id: uuid.UUID) -> bool:
        expense = self.get_expense_by_id(expense_id)
        return self.repository.delete(expense)
