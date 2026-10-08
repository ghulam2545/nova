-- =============================================================================
-- Indian Banking System
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. reference tables
-- ---------------------------------------------------------------------------
CREATE TABLE states
(
    id         INTEGER PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(4)   NOT NULL,
    region     VARCHAR(50)  NOT NULL
);

CREATE TABLE cities
(
    id        INTEGER PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    state_id  INTEGER      NOT NULL REFERENCES states (id),
    tier      SMALLINT     NOT NULL,
    pincode   VARCHAR(5)   NOT NULL
);

CREATE TABLE branches
(
    id           INTEGER PRIMARY KEY,
    branch_name  VARCHAR(200) NOT NULL,
    ifsc_code    VARCHAR(11)  NOT NULL UNIQUE,
    city_id      INTEGER      NOT NULL REFERENCES cities (id),
    state_id     INTEGER      NOT NULL REFERENCES states (id),
    address      VARCHAR(255),
    pincode      VARCHAR(6),
    phone        VARCHAR(20),
    manager_name VARCHAR(100),
    opened_date  DATE
);

CREATE TABLE account_types
(
    id            INTEGER PRIMARY KEY,
    type_name     VARCHAR(50)    NOT NULL,
    min_balance   NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2)  NOT NULL
);

CREATE TABLE transaction_types
(
    id        INTEGER PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    category  VARCHAR(10) NOT NULL,
    channel   VARCHAR(20) NOT NULL
);

CREATE TABLE card_types
(
    id            INTEGER PRIMARY KEY,
    card_name     VARCHAR(50)   NOT NULL,
    network       VARCHAR(20)   NOT NULL,
    card_category VARCHAR(10)   NOT NULL,
    annual_fee    NUMERIC(8, 2) NOT NULL
);

CREATE TABLE loan_types
(
    id                INTEGER PRIMARY KEY,
    loan_name         VARCHAR(50)   NOT NULL,
    interest_rate     NUMERIC(5, 2) NOT NULL,
    max_tenure_months INTEGER       NOT NULL
);

CREATE TABLE document_types
(
    id            INTEGER PRIMARY KEY,
    document_name VARCHAR(50) NOT NULL,
    is_mandatory  BOOLEAN     NOT NULL
);

CREATE TABLE occupation_types
(
    id              INTEGER PRIMARY KEY,
    occupation_name VARCHAR(50) NOT NULL,
    income_category VARCHAR(10) NOT NULL
);

CREATE TABLE relationship_types
(
    id                INTEGER PRIMARY KEY,
    relationship_name VARCHAR(30) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 2. employees
-- ---------------------------------------------------------------------------
CREATE TABLE employees
(
    id              BIGINT PRIMARY KEY,
    branch_id       INTEGER        NOT NULL REFERENCES branches (id),
    first_name      VARCHAR(50)    NOT NULL,
    last_name       VARCHAR(50)    NOT NULL,
    designation     VARCHAR(50)    NOT NULL,
    date_of_joining DATE           NOT NULL,
    phone           VARCHAR(15),
    email           VARCHAR(150),
    salary          NUMERIC(10, 2) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 3. customers
-- ---------------------------------------------------------------------------
CREATE TABLE customers
(
    id                 BIGINT PRIMARY KEY,
    first_name         VARCHAR(50) NOT NULL,
    last_name          VARCHAR(50) NOT NULL,
    gender             CHAR(1)     NOT NULL,
    date_of_birth      DATE        NOT NULL,
    occupation_type_id INTEGER     NOT NULL REFERENCES occupation_types (id),
    pan_number         VARCHAR(10) NOT NULL UNIQUE,
    aadhaar_number     VARCHAR(12) NOT NULL UNIQUE,
    customer_since     DATE        NOT NULL,
    branch_id          INTEGER     NOT NULL REFERENCES branches (id),
    is_active          BOOLEAN     NOT NULL
);

CREATE TABLE customer_addresses
(
    id           BIGINT PRIMARY KEY,
    customer_id  BIGINT       NOT NULL REFERENCES customers (id),
    address_line VARCHAR(255) NOT NULL,
    city_id      INTEGER      NOT NULL REFERENCES cities (id),
    state_id     INTEGER      NOT NULL REFERENCES states (id),
    pincode      VARCHAR(6)   NOT NULL,
    address_type VARCHAR(10)  NOT NULL
);

CREATE TABLE customer_kyc_documents
(
    id               BIGINT PRIMARY KEY,
    customer_id      BIGINT      NOT NULL REFERENCES customers (id),
    document_type_id INTEGER     NOT NULL REFERENCES document_types (id),
    document_number  VARCHAR(50) NOT NULL,
    verified         BOOLEAN     NOT NULL,
    verified_date    DATE
);

CREATE TABLE customer_phone_numbers
(
    id           BIGINT PRIMARY KEY,
    customer_id  BIGINT      NOT NULL REFERENCES customers (id),
    phone_number VARCHAR(15) NOT NULL,
    is_primary   BOOLEAN     NOT NULL,
    phone_type   VARCHAR(10) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 4. accounts + directly-dependent tables
-- ---------------------------------------------------------------------------
CREATE TABLE accounts
(
    id              BIGINT PRIMARY KEY,
    account_number  VARCHAR(20)    NOT NULL UNIQUE,
    customer_id     BIGINT         NOT NULL REFERENCES customers (id),
    branch_id       INTEGER        NOT NULL REFERENCES branches (id),
    account_type_id INTEGER        NOT NULL REFERENCES account_types (id),
    balance         NUMERIC(15, 2) NOT NULL,
    currency_code   VARCHAR(3)     NOT NULL,
    opened_date     DATE           NOT NULL,
    status          VARCHAR(10)    NOT NULL,
    ifsc_code       VARCHAR(11)    NOT NULL
);

CREATE TABLE account_nominees
(
    id                   BIGINT PRIMARY KEY,
    account_id           BIGINT        NOT NULL REFERENCES accounts (id),
    nominee_name         VARCHAR(100)  NOT NULL,
    relationship_type_id INTEGER       NOT NULL REFERENCES relationship_types (id),
    nominee_dob          DATE          NOT NULL,
    share_percentage     NUMERIC(5, 2) NOT NULL
);

CREATE TABLE joint_account_holders
(
    id                   BIGINT PRIMARY KEY,
    account_id           BIGINT  NOT NULL REFERENCES accounts (id),
    customer_id          BIGINT  NOT NULL REFERENCES customers (id),
    relationship_type_id INTEGER NOT NULL REFERENCES relationship_types (id)
);

-- metadata: network/feature detail (contactless, chip_enabled, tokenized, ...)
CREATE TABLE cards
(
    id           BIGINT PRIMARY KEY,
    account_id   BIGINT         NOT NULL REFERENCES accounts (id),
    card_type_id INTEGER        NOT NULL REFERENCES card_types (id),
    card_number  VARCHAR(20)    NOT NULL,
    expiry_date  DATE           NOT NULL,
    issue_date   DATE           NOT NULL,
    card_status  VARCHAR(10)    NOT NULL,
    credit_limit NUMERIC(12, 2) NOT NULL,
    metadata     JSONB
);

CREATE TABLE cheque_books
(
    id         BIGINT PRIMARY KEY,
    account_id BIGINT      NOT NULL REFERENCES accounts (id),
    issue_date DATE        NOT NULL,
    num_leaves INTEGER     NOT NULL,
    status     VARCHAR(10) NOT NULL
);

CREATE TABLE cheques
(
    id             BIGINT PRIMARY KEY,
    cheque_book_id BIGINT         NOT NULL REFERENCES cheque_books (id),
    cheque_number  VARCHAR(10)    NOT NULL,
    status         VARCHAR(10)    NOT NULL,
    amount         NUMERIC(12, 2) NOT NULL,
    issued_date    DATE           NOT NULL
);

-- ---------------------------------------------------------------------------
-- 5. deposits & loans
-- ---------------------------------------------------------------------------
CREATE TABLE fixed_deposits
(
    id               BIGINT PRIMARY KEY,
    account_id       BIGINT         NOT NULL REFERENCES accounts (id),
    principal_amount NUMERIC(14, 2) NOT NULL,
    interest_rate    NUMERIC(5, 2)  NOT NULL,
    tenure_months    INTEGER        NOT NULL,
    start_date       DATE           NOT NULL,
    maturity_date    DATE           NOT NULL,
    status           VARCHAR(10)    NOT NULL
);

CREATE TABLE recurring_deposits
(
    id                  BIGINT PRIMARY KEY,
    account_id          BIGINT         NOT NULL REFERENCES accounts (id),
    monthly_installment NUMERIC(10, 2) NOT NULL,
    interest_rate       NUMERIC(5, 2)  NOT NULL,
    tenure_months       INTEGER        NOT NULL,
    start_date          DATE           NOT NULL,
    status              VARCHAR(10)    NOT NULL
);

-- metadata: application_channel / collateral_type / processing_fee
CREATE TABLE loans
(
    id                BIGINT PRIMARY KEY,
    customer_id       BIGINT         NOT NULL REFERENCES customers (id),
    loan_type_id      INTEGER        NOT NULL REFERENCES loan_types (id),
    branch_id         INTEGER        NOT NULL REFERENCES branches (id),
    principal_amount  NUMERIC(14, 2) NOT NULL,
    interest_rate     NUMERIC(5, 2)  NOT NULL,
    tenure_months     INTEGER        NOT NULL,
    disbursement_date DATE           NOT NULL,
    status            VARCHAR(12)    NOT NULL,
    emi_amount        NUMERIC(12, 2) NOT NULL,
    metadata          JSONB
);

CREATE TABLE loan_repayments
(
    id                 BIGINT PRIMARY KEY,
    loan_id            BIGINT         NOT NULL REFERENCES loans (id),
    installment_number INTEGER        NOT NULL,
    due_date           DATE           NOT NULL,
    paid_date          DATE,
    amount_paid        NUMERIC(12, 2) NOT NULL,
    status             VARCHAR(10)    NOT NULL
);

-- ---------------------------------------------------------------------------
-- 6. beneficiaries, UPI, complaints, audit logs
-- ---------------------------------------------------------------------------
CREATE TABLE beneficiaries
(
    id                         BIGINT PRIMARY KEY,
    customer_id                BIGINT       NOT NULL REFERENCES customers (id),
    beneficiary_name           VARCHAR(100) NOT NULL,
    beneficiary_account_number VARCHAR(20)  NOT NULL,
    ifsc_code                  VARCHAR(11)  NOT NULL,
    added_date                 DATE         NOT NULL,
    nickname                   VARCHAR(50)
);

CREATE TABLE upi_ids
(
    id           BIGINT PRIMARY KEY,
    account_id   BIGINT       NOT NULL REFERENCES accounts (id),
    vpa          VARCHAR(100) NOT NULL,
    created_date DATE         NOT NULL,
    is_active    BOOLEAN      NOT NULL
);

-- metadata: channel / priority / attachments
CREATE TABLE complaints
(
    id                 BIGINT PRIMARY KEY,
    customer_id        BIGINT      NOT NULL REFERENCES customers (id),
    complaint_category VARCHAR(50) NOT NULL,
    description        TEXT,
    filed_date         DATE        NOT NULL,
    resolved_date      DATE,
    status             VARCHAR(15) NOT NULL,
    metadata           JSONB
);

-- ---------------------------------------------------------------------------
-- 7. transactions
-- ---------------------------------------------------------------------------
-- metadata: channel-appropriate device/terminal detail
CREATE TABLE transactions
(
    id                  BIGINT PRIMARY KEY,
    account_id          BIGINT         NOT NULL REFERENCES accounts (id),
    transaction_type_id INTEGER        NOT NULL REFERENCES transaction_types (id),
    amount              NUMERIC(14, 2) NOT NULL,
    balance_after       NUMERIC(15, 2) NOT NULL,
    transaction_date    TIMESTAMP      NOT NULL,
    description         VARCHAR(255),
    reference_number    VARCHAR(20)    NOT NULL,
    status              VARCHAR(10)    NOT NULL,
    channel             VARCHAR(20)    NOT NULL,
    metadata            JSONB
);

-- metadata: browser / os / session_id
CREATE TABLE audit_logs
(
    id               BIGINT PRIMARY KEY,
    customer_id      BIGINT      NOT NULL REFERENCES customers (id),
    action           VARCHAR(30) NOT NULL,
    action_timestamp TIMESTAMP   NOT NULL,
    ip_address       VARCHAR(45),
    device_info      VARCHAR(50),
    metadata         JSONB
);

-- ---------------------------------------------------------------------------
-- Recommended indexes
-- ---------------------------------------------------------------------------
-- CREATE INDEX idx_accounts_customer_id       ON accounts(id);
-- CREATE INDEX idx_transactions_account_id    ON transactions(id);
-- CREATE INDEX idx_transactions_txn_date      ON transactions(transaction_date);
-- CREATE INDEX idx_loan_repayments_loan_id    ON loan_repayments(id);
-- CREATE INDEX idx_customer_addresses_cust_id ON customer_addresses(id);
-- CREATE INDEX idx_audit_logs_customer_id     ON audit_logs(id);
-- jsonb metadata columns: GIN indexes only if you'll query inside them
-- CREATE INDEX idx_transactions_metadata_gin ON transactions USING GIN (metadata);
-- CREATE INDEX idx_loans_metadata_gin        ON loans USING GIN (metadata);