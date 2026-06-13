-- ==========================================
-- SPDX-License-Identifier: Apache-2.0
-- Description: Supabase Production Database Schema
-- Focus: Artist applications, Single Track releases, Plan Pricing Configuration, and automated Price Audit logs
-- ==========================================

-- ---------------------------------------------------------------------
-- 1. CLEANUP / RESET STAGE (Idempotency)
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_on_price_change ON pricing_plans;
DROP FUNCTION IF EXISTS log_price_change();
DROP TABLE IF EXISTS price_change_logs CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;
DROP TABLE IF EXISTS single_track_releases CASCADE;
DROP TABLE IF EXISTS applications CASCADE;

-- Enable UUID generation extension if not done already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 2. "applications" TABLE (Subscription Registrations)
-- ---------------------------------------------------------------------
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL, -- Links to auth.users if logged in
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    stage_name VARCHAR(255),
    contact_number VARCHAR(100),
    plan VARCHAR(50) NOT NULL, -- 'basic', 'pro', 'elite'
    is_annual BOOLEAN DEFAULT TRUE NOT NULL,
    referral VARCHAR(255),
    receipt TEXT, -- Receipt preview base64 data URL or Storage URI
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE INDEXES for speedy search / admin parsing
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_status ON applications(status);


-- ---------------------------------------------------------------------
-- 3. "single_track_releases" TABLE (Single Track Registrations)
-- ---------------------------------------------------------------------
CREATE TABLE single_track_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL, -- Links to auth.users if logged in
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    featured_artists VARCHAR(255),
    genre VARCHAR(100) DEFAULT 'Electronic' NOT NULL,
    release_date DATE NOT NULL,
    label_name VARCHAR(255),
    is_dolby_atmos BOOLEAN DEFAULT FALSE NOT NULL,
    has_content_id BOOLEAN DEFAULT FALSE NOT NULL,
    lyrics TEXT,
    plan VARCHAR(50) NOT NULL, -- 'basic', 'pro', 'elite'
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Live & Transmitting' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_releases_user_id ON single_track_releases(user_id);
CREATE INDEX idx_releases_artist ON single_track_releases(artist);


-- ---------------------------------------------------------------------
-- 4. "pricing_plans" TABLE (Current active configuration)
-- ---------------------------------------------------------------------
CREATE TABLE pricing_plans (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'sub_basic', 'sub_pro', 'sub_elite', 'single_basic', 'single_pro', 'single_elite'
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'subscription_annual', 'subscription_monthly', 'single_release'
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ---------------------------------------------------------------------
-- 5. "price_change_logs" TABLE (Audit log history)
-- ---------------------------------------------------------------------
CREATE TABLE price_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(50) NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    changed_by_user UUID DEFAULT NULL, -- Stores auth.uid() if executed inside web context
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_price_change_plan ON price_change_logs(plan_id);


-- ---------------------------------------------------------------------
-- 6. DB TRIGGER: Log Price Changes automatically
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only write history log if the price actually updated
    IF OLD.price IS DISTINCT FROM NEW.price THEN
        INSERT INTO price_change_logs (
            plan_id,
            plan_name,
            old_price,
            new_price,
            changed_by_user
        ) VALUES (
            OLD.id,
            OLD.name,
            OLD.price,
            NEW.price,
            auth.uid() -- Automatically fetches context in Supabase web workspace
        );
    END IF;
    
    -- update the updated_at timestamp on the pricing record
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_price_change
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION log_price_change();


-- ---------------------------------------------------------------------
-- 7. SEED DATA: Insert default pricing values
-- ---------------------------------------------------------------------
INSERT INTO pricing_plans (id, name, type, price, currency) VALUES
('sub_basic', 'Basic Subscription Plans', 'subscription_annual', 12.00, 'USD'),
('sub_pro', 'Pro Subscription Plans', 'subscription_annual', 29.00, 'USD'),
('sub_elite', 'Elite Subscription Plans', 'subscription_annual', 59.00, 'USD'),
('single_basic', 'Basic Single Track', 'single_release', 19.00, 'INR'),
('single_pro', 'Pro Single Track', 'single_release', 39.00, 'INR'),
('single_elite', 'Elite Single Track', 'single_release', 79.00, 'INR')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    type = EXCLUDED.type, 
    price = EXCLUDED.price;


-- ---------------------------------------------------------------------
-- 8. SECURITY - ENABLE ROW LEVEL SECURITY (RLS) FOR HYPER-SECURITY
-- ---------------------------------------------------------------------
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE single_track_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_change_logs ENABLE ROW LEVEL SECURITY;

-- Applications RLS Policies:
-- 1. Allow anyone to enter application (Insert) securely for onboarding transitions
CREATE POLICY "Allow anonymous application signups" 
ON applications FOR INSERT 
WITH CHECK (true);

-- 2. Artists can only select/view their own applications based on verified user_id or verified email
CREATE POLICY "Users can view their own profile logs" 
ON applications FOR SELECT 
USING (
    auth.uid() = user_id 
    OR auth.jwt() ->> 'email' = email
);

-- Single Track Releases RLS Policies:
-- 1. Allow any authenticated / anonymous release submissions
CREATE POLICY "Allow direct track release insertions" 
ON single_track_releases FOR INSERT 
WITH CHECK (true);

-- 2. Artists can view their own track logs
CREATE POLICY "Users can retrieve their track catalog" 
ON single_track_releases FOR SELECT 
USING (
    auth.uid() = user_id
);

-- Pricing Plans RLS Policies:
-- 1. All users can view current pricing levels
CREATE POLICY "Public pricing info viewable by everyone" 
ON pricing_plans FOR SELECT 
USING (true);

-- Price Change Logs RLS Policies:
-- 1. Viewable only by admin / logged-in users tracking pricing shifts
CREATE POLICY "Authorized individuals can read price logs" 
ON price_change_logs FOR SELECT 
USING (auth.role() = 'authenticated');


-- ---------------------------------------------------------------------
-- 9. DEV-FRIENDLY TESTING INSTRUCTIONS (Mock Update to trigger audit log!)
-- ---------------------------------------------------------------------
-- Execute the following command in Supabase to test database triggers:
-- UPDATE pricing_plans SET price = 41.00 WHERE id = 'single_pro';
-- SELECT * FROM price_change_logs;
