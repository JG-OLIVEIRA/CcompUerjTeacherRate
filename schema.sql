-- Tabela para armazenar as matérias (disciplinas)
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Tabela para armazenar os professores
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Tabela para armazenar as avaliações
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    text TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    teacher_id INT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    reported BOOLEAN DEFAULT FALSE,
    report_count INT DEFAULT 0,
    approval_votes INT DEFAULT 0
);

-- Tabela para armazenar solicitações de professores
CREATE TABLE professor_requests (
    id SERIAL PRIMARY KEY,
    professor_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- ex: pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar a performance das consultas
CREATE INDEX idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX idx_reviews_subject_id ON reviews(subject_id);
CREATE INDEX idx_reviews_reported ON reviews(reported);
