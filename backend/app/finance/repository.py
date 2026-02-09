"""
Finance Module Repository
Database operations for PaymentMethod and Expense
"""

import uuid
from typing import List, Optional
from sqlmodel import Session, select
from app.finance.models import PaymentMethod, Expense


class PaymentMethodRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, payment_method_id: uuid.UUID) -> Optional[PaymentMethod]:
        return self.session.get(PaymentMethod, payment_method_id)
    
    def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = False) -> List[PaymentMethod]:
        statement = select(PaymentMethod)
        if active_only:
            statement = statement.where(PaymentMethod.is_active == True)
        statement = statement.offset(skip).limit(limit)
        return list(self.session.exec(statement).all())
    
    def create(self, payment_method: PaymentMethod) -> PaymentMethod:
        self.session.add(payment_method)
        self.session.commit()
        self.session.refresh(payment_method)
        return payment_method
    
    def update(self, payment_method_id: uuid.UUID, data: dict) -> Optional[PaymentMethod]:
        payment_method = self.get_by_id(payment_method_id)
        if not payment_method:
            return None
        
        for key, value in data.items():
            if value is not None:
                setattr(payment_method, key, value)
        
        from datetime import datetime
        payment_method.updated_at = datetime.utcnow()
        
        self.session.add(payment_method)
        self.session.commit()
        self.session.refresh(payment_method)
        return payment_method
    
    def delete(self, payment_method: PaymentMethod) -> bool:
        self.session.delete(payment_method)
        self.session.commit()
        return True


class ExpenseRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, expense_id: uuid.UUID) -> Optional[Expense]:
        return self.session.get(Expense, expense_id)
    
    def get_all(self, skip: int = 0, limit: int = 100, property_id: Optional[uuid.UUID] = None) -> List[Expense]:
        statement = select(Expense)
        if property_id:
            statement = statement.where(Expense.property_id == property_id)
        statement = statement.offset(skip).limit(limit).order_by(Expense.date.desc())
        return list(self.session.exec(statement).all())
    
    def create(self, expense: Expense) -> Expense:
        self.session.add(expense)
        self.session.commit()
        self.session.refresh(expense)
        return expense
    
    def update(self, expense_id: uuid.UUID, data: dict) -> Optional[Expense]:
        expense = self.get_by_id(expense_id)
        if not expense:
            return None
        
        for key, value in data.items():
            if value is not None:
                setattr(expense, key, value)
        
        from datetime import datetime
        expense.updated_at = datetime.utcnow()
        
        self.session.add(expense)
        self.session.commit()
        self.session.refresh(expense)
        return expense
    
    def delete(self, expense: Expense) -> bool:
        self.session.delete(expense)
        self.session.commit()
        return True
