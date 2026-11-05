
BEGIN;

CREATE TABLE payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    plan_id VARCHAR(50) NOT NULL,
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,

    amount INTEGER NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    status VARCHAR(20) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'paid', 'failed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT payments_plan_id_check
        CHECK (plan_id IN ('pro_monthly', 'pro_six_month'))
);

CREATE INDEX idx_payments_user_created
    ON payments (user_id, created_at DESC);


CREATE TABLE subscriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,

    plan_id VARCHAR(50) NOT NULL
        CHECK (plan_id IN ('pro_monthly', 'pro_six_month')),

    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subscriptions_valid_period_check
        CHECK (expires_at > starts_at)
);

CREATE INDEX idx_subscriptions_user_expiry
    ON subscriptions (user_id, expires_at DESC);


CREATE TABLE webhook_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id VARCHAR(150) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,

    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;

BEGIN;

CREATE TABLE payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    plan_id VARCHAR(50) NOT NULL,
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,

    amount INTEGER NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    status VARCHAR(20) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'paid', 'failed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT payments_plan_id_check
        CHECK (plan_id IN ('pro_monthly', 'pro_six_month'))
);

CREATE INDEX idx_payments_user_created
    ON payments (user_id, created_at DESC);


CREATE TABLE subscriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,

    plan_id VARCHAR(50) NOT NULL
        CHECK (plan_id IN ('pro_monthly', 'pro_six_month')),

    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subscriptions_valid_period_check
        CHECK (expires_at > starts_at)
);

CREATE INDEX idx_subscriptions_user_expiry
    ON subscriptions (user_id, expires_at DESC);


CREATE TABLE webhook_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id VARCHAR(150) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,

    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
