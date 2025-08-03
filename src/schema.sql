-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS admin_sessions;
DROP TABLE IF EXISTS admins;

-- Create the admins table
-- This table stores the login credentials for administrators.
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Create the admin_sessions table
-- This table is required by lucia-auth to manage login sessions.
-- It references the admins table.
CREATE TABLE admin_sessions (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    user_id INTEGER NOT NULL REFERENCES admins(id)
);

-- Insert your admin user
-- IMPORTANT: Replace 'admin@exemplo.com' with your actual email
-- and 'senha_segura' with your desired password.
-- This password is in plain text. For a real production environment,
-- you should hash the passwords.
INSERT INTO admins (email, password) VALUES ('admin@exemplo.com', 'senha_segura');
