-- Update existing admin user
-- Run this in Supabase SQL editor

UPDATE admin_users 
SET username = 'bankolejohn@gmail.com', 
    email = 'bankolejohn@gmail.com'
WHERE username = 'admin';