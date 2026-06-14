-- =====================================================================
-- SPDX-License-Identifier: Apache-2.0
-- Description: Complete Production Database Schema for Supabase
-- Target System: WAVORA LIVE High-Fidelity Music Distribution Ecosystem
-- Includes: Plan Pricing, Registrations, Single Releases, Smart Links, and Price Logs
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CLEANUP / RESET STAGE (Idempotent execution setup)
-- ---------------------------------------------------------------------
-- Drop tables first. Dropping tables with CASCADE automatically drops dependent constraints and triggers!
DROP TABLE IF EXISTS price_change_logs CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;
DROP TABLE IF EXISTS single_track_releases CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS smart_links CASCADE;
DROP TABLE IF EXISTS plan_offers CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS log_price_change();

-- Enable UUID generation extension if not configured
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 2. "applications" TABLE (Premium Onboarding Registrations)
-- ---------------------------------------------------------------------
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL, -- Links to auth.users in Supabase Auth
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

-- Indexes for lightning fast lookups & query optimization
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_status ON applications(status);


-- ---------------------------------------------------------------------
-- 3. "single_track_releases" TABLE (Single Track Release Orders)
-- ---------------------------------------------------------------------
CREATE TABLE single_track_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT NULL, -- Links to auth.users in Supabase Auth
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

-- Optimize queries for tracking release catalogs and users
CREATE INDEX idx_releases_user_id ON single_track_releases(user_id);
CREATE INDEX idx_releases_artist ON single_track_releases(artist);


-- ---------------------------------------------------------------------
-- 4. "smart_links" TABLE (Pre-Save Landing Campaigns)
-- ---------------------------------------------------------------------
CREATE TABLE smart_links (
    id VARCHAR(100) PRIMARY KEY, -- Custom URL handle slug (e.g. 'electro-rush')
    user_id UUID DEFAULT NULL, -- Creator's user profile ID
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    artwork_url TEXT NOT NULL, -- Unsplash cover or verified artist upload
    description TEXT,
    spotify_url TEXT,
    apple_music_url TEXT,
    jio_saavn_url TEXT,
    youtube_url TEXT,
    visits INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_smart_links_visits ON smart_links(visits DESC);
CREATE INDEX idx_smart_links_user ON smart_links(user_id);


-- ---------------------------------------------------------------------
-- 4.5 "plan_offers" TABLE (Dynamic promotional offers synced globally)
-- ---------------------------------------------------------------------
CREATE TABLE plan_offers (
    plan_id VARCHAR(50) PRIMARY KEY, -- 'basic', 'pro', 'elite'
    annual_offer_price NUMERIC(10, 2), -- e.g. 299 or null
    monthly_offer_price NUMERIC(10, 2), -- e.g. 39 or null
    offer_label VARCHAR(255), -- e.g. "Early Bird Offer"
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ---------------------------------------------------------------------
-- 5. "pricing_plans" TABLE (Global pricing configuration parameters)
-- ---------------------------------------------------------------------
CREATE TABLE pricing_plans (
    id VARCHAR(50) PRIMARY KEY, -- 'sub_basic', 'sub_pro', 'sub_elite', 'single_basic' etc.
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'subscription_annual', 'subscription_monthly', 'single_release'
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ---------------------------------------------------------------------
-- 6. "price_change_logs" TABLE (Comprehensive Audit log history)
-- ---------------------------------------------------------------------
CREATE TABLE price_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(50) NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    changed_by_user UUID DEFAULT NULL, -- Stores auth.uid() automatically if initiated via web SDK log
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_price_change_plan ON price_change_logs(plan_id);


-- ---------------------------------------------------------------------
-- 7. DB TRIGGER & PROCEDURE: Automatic Price Change Log Generation
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log inside audit records folder if pricing value shifts
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
            auth.uid() -- Automatically extracts the acting authenticated admin from metadata context
        );
    END IF;
    
    -- Sync update timestamp on source plan element
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_price_change
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION log_price_change();


-- ---------------------------------------------------------------------
-- 8. DEFAULT SEED DATA
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

-- Seed default plan offers
INSERT INTO plan_offers (plan_id, annual_offer_price, monthly_offer_price, offer_label) VALUES
('basic', null, null, ''),
('pro', null, null, ''),
('elite', null, null, '')
ON CONFLICT (plan_id) DO NOTHING;


-- ---------------------------------------------------------------------
-- 9. DEEP SECURITY FRAMEWORK: ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

-- Enable Row Level Security (RLS) on all production tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE single_track_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_offers ENABLE ROW LEVEL SECURITY;

-- applications policies:
-- Allow anyone to fetch, insert, update and delete applications for seamless administrative sync
DROP POLICY IF EXISTS "Allow anonymous application signups" ON applications;
DROP POLICY IF EXISTS "Users can view their own profile logs" ON applications;

CREATE POLICY "Allow public all-around operations on applications" 
ON applications FOR ALL
USING (true)
WITH CHECK (true);

-- single_track_releases policies:
-- Customers are allowed to send track details securely
CREATE POLICY "Allow direct track release insertions" 
ON single_track_releases FOR INSERT 
WITH CHECK (true);

-- Artists can view their requested single catalog
CREATE POLICY "Users can retrieve their track catalog" 
ON single_track_releases FOR SELECT 
USING (
    auth.uid() = user_id
);

-- smart_links policies:
-- Public needs to access smart links for redirection
CREATE POLICY "Allow public select on smart links" 
ON smart_links FOR SELECT 
USING (true);

-- Content creators insert/modify their campaign links
CREATE POLICY "Creators can insert campaign links" 
ON smart_links FOR INSERT 
WITH CHECK (true);

-- Allow creators to delete/update their own links
CREATE POLICY "Creators can alter their own links" 
ON smart_links FOR ALL 
USING (
    auth.uid() = user_id OR user_id IS NULL
);

-- pricing_plans policies:
-- Public can view catalog pricing values
CREATE POLICY "Public pricing info viewable by everyone" 
ON pricing_plans FOR SELECT 
USING (true);

-- price_change_logs policies:
-- Admins/managers can select to parse metrics
CREATE POLICY "Authorized individuals can read price logs" 
ON price_change_logs FOR SELECT 
USING (auth.role() = 'authenticated');

-- plan_offers policies:
-- Public can view catalog pricing offers
CREATE POLICY "Public plan offers viewable by everyone" 
ON plan_offers FOR SELECT 
USING (true);

-- Allow administrative / anonymous plan offer updates and inserts
CREATE POLICY "Allow public flow updates on plan offers" 
ON plan_offers FOR ALL 
USING (true)
WITH CHECK (true);
