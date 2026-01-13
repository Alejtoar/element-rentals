# Financial Rules - Element Rentals

## 1. Legal Entities & Roles
* Operator: ELEMNT RENTALS S.A.S. (NIT 902.009.784-9) .
* Owner: The titleholder of the property.
* Guest: The person or entity paying for accommodation services.
* Mandate: The Operator acts as a mandatary for the Owner to manage, promote, and collect payments.

## 2. Revenue & Payout Formula (Owner Settlement)
The system must calculate the monthly "Net Income" for the Owner following this strict sequence:


### Gross Income: Total revenue collected from all booking channels.

### Deductions (Pre-Commission):

* Channel Commissions: Fees paid to platforms like Airbnb, Booking.com, etc.

* Cleaning Services: Cost of cleaning per stay (unless paid directly by the platform).

* Basic Supplies: Costs for salt, pepper, tea, water, and cleaning supplies.

* Tax Withholdings: Applicable legal taxes.


### Depurated Income: Gross Income - Deductions.

### Final Split:

* Operator Commission: 20% of Depurated Income.

* Owner Payout: 80% of Depurated Income.

## 3. Booking & Payment Policy

* Deposit: A 50% non-refundable deposit is required to confirm a reservation.

* Balance: The remaining 50% must be paid before check-in.

* Non-Payment: If the balance is not paid, the Operator is not obliged to deliver the property.

* Cancellation: In case of a "No Show" or unjustified cancellation, the 50% deposit is retained as a penalty for lost profit.

## 4. Charges, Damages & Penalties

Guest Damages: Any damage caused by the guest is billed as a "Charge".


* Exclusion: Damage-related charges do not reduce Owner revenue unless the guest fails to pay and the Operator must cover the repair.

### * Specific Penalties:


* Lost Key/Card: $120.000 COP.

* Lockout (Key left inside): $30.000 COP.


Third-Party Fees: The "Resort Fee" or identification wristbands ($24.000 COP per person) are paid directly to the Building Administration and are not revenue for the Operator.

## 5. Settlement Calendar

* Reporting: The Operator must render a monthly balance to the Owner.

* Payment Date: Payouts are executed on the 7th day of each month.

* Holiday Rule: If the 7th is a non-business day, payment is moved to the next business day.

## 6. Computational Invariants (System Rules)
- **Net Revenue & Beneficiary Logic**:
    - **Inclusion**: Only payments with `beneficiary == 'company'` are included in `Gross Income`.
    - **Exclusion**: Payments with `beneficiary == 'third_party'` (e.g., Resort Fees, Building Wristbands) are recorded for auditability but MUST be excluded from all Income/Payout calculations.
- **Charge Protection**: Guest-paid charges for damages are categorized as "Reimbursements". They do not affect the 20/80 split.
- **Unpaid Damages**: If a damage `Charge` remains `paid == false` and a repair is needed, the cost is recorded as a `deductible_expenses` in the `FinancialStatement`, effectively reducing both the Operator's and Owner's final payout proportionally.
- **Calculation Order**: 
    `Depurated Income = Gross Income - (Platform Fees + Cleaning + Supplies + Taxes)`.
    `Operator Commission = Depurated Income * 0.20`.
    `Owner Payout = Depurated Income * 0.80`.