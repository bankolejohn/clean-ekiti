-- Create admin user
-- Run this in Supabase SQL editor

INSERT INTO admin_users (username, email, password_hash) VALUES 
('admin', 'admin@cleanekiti.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL9.KeF2');