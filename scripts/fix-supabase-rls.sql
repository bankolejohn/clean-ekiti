-- Fix RLS policies for production
-- Run this in Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can access admin_users" ON admin_users;
DROP POLICY IF EXISTS "Service role can update reports" ON reports;
DROP POLICY IF EXISTS "Service role can delete reports" ON reports;

-- Recreate with proper service role detection
CREATE POLICY "Service role can access admin_users" ON admin_users
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Service role can update reports" ON reports
    FOR UPDATE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Service role can delete reports" ON reports
    FOR DELETE USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.role() = 'service_role'
    );