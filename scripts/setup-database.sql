-- CleanEkiti Database Setup
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('dumping', 'flooding', 'pollution', 'drainage', 'other')),
    description TEXT,
    image_url VARCHAR(500),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
    reporter_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Status History Table (for future enhancements)
CREATE TABLE report_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);

-- RLS (Row Level Security) policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reports
CREATE POLICY "Public can view reports" ON reports
    FOR SELECT USING (true);

-- Allow public insert to reports
CREATE POLICY "Public can insert reports" ON reports
    FOR INSERT WITH CHECK (true);

-- Only service role can update/delete reports (admin only)
CREATE POLICY "Service role can update reports" ON reports
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete reports" ON reports
    FOR DELETE USING (auth.role() = 'service_role');

-- Admin users policies (allow service role access)
CREATE POLICY "Service role can access admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "No public access to admin_users" ON admin_users
    FOR ALL USING (false);

-- Sample admin user (password: admin123)
-- Change this password in production!
INSERT INTO admin_users (username, email, password_hash) VALUES 
('admin', 'admin@cleanekiti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL9.KeF2');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();