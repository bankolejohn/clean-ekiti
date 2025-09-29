-- Fix admin password hash
-- Run this in Supabase SQL editor

UPDATE admin_users 
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL9.KeF2'
WHERE username = 'bankolejohn@gmail.com';