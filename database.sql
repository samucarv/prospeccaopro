CREATE DATABASE IF NOT EXISTS prospeccao_db;
USE prospeccao_db;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Em produção, use hash!
  profile VARCHAR(50) NOT NULL,
  created_at BIGINT
);

CREATE TABLE IF NOT EXISTS prospects (
  id VARCHAR(36) PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL,
  observations TEXT,
  status VARCHAR(50) NOT NULL,
  next_step VARCHAR(50) NOT NULL,
  
  -- Metadados e Caminhos dos Arquivos
  proposal_name VARCHAR(255),
  proposal_path VARCHAR(500),
  proposal_size INT,
  proposal_date VARCHAR(100),
  
  counter_proposal_name VARCHAR(255),
  counter_proposal_path VARCHAR(500),
  counter_proposal_size INT,
  counter_proposal_date VARCHAR(100),
  
  created_at BIGINT,
  updated_at BIGINT
);

-- Inserir usuário admin padrão (senha: 123)
INSERT INTO users (id, name, username, password, profile, created_at)
SELECT 'admin-1', 'Administrador Principal', 'admin', '123', 'Administrador', UNIX_TIMESTAMP() * 1000
WHERE NOT EXISTS (SELECT * FROM users WHERE username = 'admin');
