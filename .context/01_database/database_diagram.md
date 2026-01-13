erDiagram

    OWNER ||--o{ PROPERTY : owns
    OWNER ||--o{ MANAGEMENT_CONTRACT : signs

    PROPERTY ||--o{ MANAGEMENT_CONTRACT : governed_by
    PROPERTY ||--o{ RESERVATION : has
    PROPERTY ||--o{ EXPENSE_PROPERTY : allocates
    PROPERTY ||--o{ INVENTORY_ITEM : contains
    PROPERTY ||--o{ FINANCIAL_STATEMENT : reports

    GUEST ||--o{ RESERVATION : books

    CHANNEL ||--o{ RESERVATION : sources

    RESERVATION ||--o{ PAYMENT : generates
    RESERVATION ||--o{ CHARGE : may_create
    RESERVATION ||--o{ STAY_EVENT : tracks
    RESERVATION ||--|| CONTRACT_ACCEPTANCE : requires

    EXPENSE ||--o{ EXPENSE_PROPERTY : distributed_to

    FINANCIAL_STATEMENT ||--|| PAYOUT : settles

    USER ||--o{ EXPENSE : records
    USER ||--o{ FINANCIAL_STATEMENT : generates

    OWNER {
        UUID id PK
        string full_name
        string email
        string phone
        timestamp created_at
    }

    PROPERTY {
        UUID id PK
        UUID owner_id FK
        string name
        string address
        string city
        string country
        int max_guests
        boolean active
        timestamp created_at
    }

    MANAGEMENT_CONTRACT {
        UUID id PK
        UUID owner_id FK
        UUID property_id FK
        decimal commission_rate
        boolean exclusive
        date start_date
        date end_date
        boolean active
        timestamp created_at
    }

    GUEST {
        UUID id PK
        string full_name
        string email
        string phone
        timestamp created_at
    }

    CHANNEL {
        UUID id PK
        string name
        boolean external
        timestamp created_at
    }

    RESERVATION {
        UUID id PK
        UUID property_id FK
        UUID guest_id FK
        UUID channel_id FK
        string reservation_type
        date start_date
        date end_date
        int guest_count
        decimal total_amount
        string status
        timestamp created_at
    }

    PAYMENT {
        UUID id PK
        UUID reservation_id FK
        decimal amount
        string payment_type
        boolean non_refundable
        string provider
        string beneficiary
        string status
        timestamp paid_at
        timestamp created_at
    }

    CHARGE {
        UUID id PK
        UUID reservation_id FK
        string type
        string description
        decimal amount
        string beneficiary
        boolean paid
        timestamp created_at
    }

    EXPENSE {
        UUID id PK
        string category
        decimal total_amount
        boolean deductible
        boolean charged_to_guest
        UUID reservation_id FK
        string description
        string support_document
        date incurred_at
        timestamp created_at
    }

    EXPENSE_PROPERTY {
        UUID id PK
        UUID expense_id FK
        UUID property_id FK
        decimal allocated_amount
        timestamp created_at
    }

    FINANCIAL_STATEMENT {
        UUID id PK
        UUID property_id FK
        date period_start
        date period_end
        decimal gross_income
        decimal platform_fees
        decimal deductible_expenses
        decimal net_income
        decimal operator_commission
        decimal owner_payout
        timestamp generated_at
    }

    PAYOUT {
        UUID id PK
        UUID financial_statement_id FK
        decimal amount
        string payment_method
        timestamp paid_at
        timestamp created_at
    }

    STAY_EVENT {
        UUID id PK
        UUID reservation_id FK
        string event_type
        timestamp occurred_at
        string notes
    }

    CONTRACT_ACCEPTANCE {
        UUID id PK
        UUID reservation_id FK
        timestamp accepted_at
        string ip_address
        string user_agent
        boolean signed
    }

    INVENTORY_ITEM {
        UUID id PK
        UUID property_id FK
        string name
        int quantity
        string condition
        timestamp created_at
    }

    USER {
        UUID id PK
        string email
        string role
        timestamp created_at
    }
