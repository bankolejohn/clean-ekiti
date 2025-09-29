-- Fix admin access policies
-- Run this in Supabase SQL editor to enable admin functionality

-- Add service role access to admin_users table
CREATE POLICY "Service role can access admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Add service role access to update/delete reports
CREATE POLICY "Service role can update reports" ON reports
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete reports" ON reports
    FOR DELETE USING (auth.role() = 'service_role');