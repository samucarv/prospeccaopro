import express from 'express';
import mysql from 'mysql2';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuração para simular __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Configuração do CORS
app.use(cors());
app.use(express.json());

// Verifica e cria a pasta de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {
        console.error("Erro ao criar pasta uploads:", e);
    }
}
app.use('/uploads', express.static(uploadsDir));

// === SERVIR FRONTEND (UNIFICAÇÃO) ===
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

// Configuração Básica do MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true
};

const initDbConnection = mysql.createConnection(dbConfig);

const initScript = `
  CREATE DATABASE IF NOT EXISTS prospeccao_db;
  USE prospeccao_db;

  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(50) NOT NULL,
    created_at BIGINT
  );

  CREATE TABLE IF NOT EXISTS prospects (
    id VARCHAR(255) PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    observations TEXT,
    status VARCHAR(50) NOT NULL,
    next_step VARCHAR(50) NOT NULL,
    date VARCHAR(20),
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

  ALTER TABLE users MODIFY COLUMN id VARCHAR(255);
  ALTER TABLE prospects MODIFY COLUMN id VARCHAR(255);
  
  SET @dbname = DATABASE();
  SET @tablename = "prospects";
  SET @columnname = "date";
  SET @preparedStatement = (SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE
        (table_name = @tablename)
        AND (table_schema = @dbname)
        AND (column_name = @columnname)
    ) > 0,
    "SELECT 1",
    "ALTER TABLE prospects ADD COLUMN date VARCHAR(20);"
  ));
  PREPARE alterIfNotExists FROM @preparedStatement;
  EXECUTE alterIfNotExists;
  DEALLOCATE PREPARE alterIfNotExists;

  INSERT IGNORE INTO users (id, name, username, password, profile, created_at) 
  VALUES ('admin-1', 'Administrador Principal', 'admin', '123', 'Administrador', ${Date.now()});
`;

initDbConnection.connect((err) => {
  if (err) {
    console.error('❌ Erro MySQL (Conexão Inicial):', err.message);
  } else {
    initDbConnection.query(initScript, (err) => {
      if (err) console.log('ℹ️  Info DB:', err.message);
      else console.log('✅ Banco de dados pronto.');
      initDbConnection.end();
    });
  }
});

const db = mysql.createPool({
  ...dbConfig,
  database: 'prospeccao_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});
const upload = multer({ storage: storage });

const handleError = (res, err, context) => {
    console.error(`Erro em ${context}:`, err);
    res.status(500).json({ message: err.sqlMessage || err.message || 'Erro interno' });
};

// --- ROTAS DA API ---

app.use((req, res, next) => {
  next();
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return handleError(res, err, 'Login');
    // @ts-ignore
    if (results.length > 0) res.json(results[0]);
    else res.status(401).json({ message: 'Credenciais inválidas' });
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return handleError(res, err, 'Listar Usuários');
    res.json(results);
  });
});

app.post('/api/users', (req, res) => {
  const { id, name, username, password, profile, createdAt } = req.body;
  db.query('INSERT INTO users (id, name, username, password, profile, created_at) VALUES (?, ?, ?, ?, ?, ?)', 
    [id, name, username, password, profile, createdAt], 
    (err) => {
      if (err) return handleError(res, err, 'Criar Usuário');
      res.json({ message: 'Usuário criado' });
    }
  );
});

app.put('/api/users/:id', (req, res) => {
  const { name, username, password, profile } = req.body;
  const { id } = req.params;
  let sql, params;
  if (password) {
      sql = 'UPDATE users SET name = ?, username = ?, password = ?, profile = ? WHERE id = ?';
      params = [name, username, password, profile, id];
  } else {
      sql = 'UPDATE users SET name = ?, username = ?, profile = ? WHERE id = ?';
      params = [name, username, profile, id];
  }
  db.query(sql, params, (err) => {
    if (err) return handleError(res, err, 'Atualizar Usuário');
    res.json({ message: 'Usuário atualizado' });
  });
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT profile FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return handleError(res, err, 'Buscar User');
        // @ts-ignore
        const userToDelete = results[0];
        if (!userToDelete) return res.status(404).json({message: 'User não encontrado'});

        db.query('SELECT COUNT(*) as count FROM users WHERE profile = "Administrador"', (err, countRes) => {
             // @ts-ignore
            if (userToDelete.profile === 'Administrador' && countRes[0].count <= 1) {
                return res.status(400).json({ message: 'Não pode excluir o último admin.' });
            }
            db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
                if (err) return handleError(res, err, 'Del User');
                res.json({ message: 'Excluído' });
            });
        });
    });
});

app.get('/api/prospects', (req, res) => {
  db.query('SELECT * FROM prospects ORDER BY updated_at DESC', (err, results) => {
    if (err) return handleError(res, err, 'Listar Prospects');
    // @ts-ignore
    const formatted = results.map(p => ({
      id: p.id,
      brandName: p.brand_name,
      observations: p.observations,
      status: p.status,
      nextStep: p.next_step,
      date: p.date, 
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      proposal: p.proposal_path ? { name: p.proposal_name, path: p.proposal_path, size: p.proposal_size, date: p.proposal_date } : undefined,
      counterProposal: p.counter_proposal_path ? { name: p.counter_proposal_name, path: p.counter_proposal_path, size: p.counter_proposal_size, date: p.counter_proposal_date } : undefined
    }));
    res.json(formatted);
  });
});

const cpUpload = upload.fields([{ name: 'proposal', maxCount: 1 }, { name: 'counterProposal', maxCount: 1 }]);

app.post('/api/prospects', cpUpload, (req, res) => {
  const { id, brandName, observations, status, nextStep, date, createdAt, updatedAt } = req.body;
  // @ts-ignore
  const files = req.files || {};
  
  console.log('--- NOVO PROSPECT ---', { brandName, date });

  const proposal = files['proposal'] ? files['proposal'][0] : null;
  const counterProposal = files['counterProposal'] ? files['counterProposal'][0] : null;

  let finalDate = date;
  if (!finalDate || finalDate === 'undefined' || finalDate === 'null') {
    finalDate = new Date().toISOString().split('T')[0];
  }

  const sql = `INSERT INTO prospects (
    id, brand_name, observations, status, next_step, \`date\`,
    proposal_name, proposal_path, proposal_size, proposal_date,
    counter_proposal_name, counter_proposal_path, counter_proposal_size, counter_proposal_date,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    id, brandName, observations, status, nextStep, finalDate,
    proposal ? proposal.originalname : null,
    proposal ? proposal.filename : null,
    proposal ? proposal.size : null,
    proposal ? new Date().toISOString() : null,
    counterProposal ? counterProposal.originalname : null,
    counterProposal ? counterProposal.filename : null,
    counterProposal ? counterProposal.size : null,
    counterProposal ? new Date().toISOString() : null,
    createdAt || Date.now(),
    updatedAt || Date.now()
  ];

  db.query(sql, values, (err) => {
    if (err) return handleError(res, err, 'Criar Prospect');
    res.json({ message: 'Criado com sucesso' });
  });
});

app.put('/api/prospects/:id', cpUpload, (req, res) => {
  const { id } = req.params;
  const { brandName, observations, status, nextStep, date, updatedAt } = req.body;
  // @ts-ignore
  const files = req.files || {};

  console.log('--- ATUALIZA PROSPECT ---', { id, date });

  const proposal = files['proposal'] ? files['proposal'][0] : null;
  const counterProposal = files['counterProposal'] ? files['counterProposal'][0] : null;

  let finalDate = date;
  if (!finalDate || finalDate === 'undefined' || finalDate === 'null') {
    finalDate = new Date().toISOString().split('T')[0];
  }

  let sql = 'UPDATE prospects SET brand_name=?, observations=?, status=?, next_step=?, `date`=?, updated_at=?';
  const values = [brandName, observations, status, nextStep, finalDate, updatedAt || Date.now()];

  if (proposal) {
    sql += ', proposal_name=?, proposal_path=?, proposal_size=?, proposal_date=?';
    values.push(proposal.originalname, proposal.filename, proposal.size, new Date().toISOString());
  }
  if (counterProposal) {
    sql += ', counter_proposal_name=?, counter_proposal_path=?, counter_proposal_size=?, counter_proposal_date=?';
    values.push(counterProposal.originalname, counterProposal.filename, counterProposal.size, new Date().toISOString());
  }

  sql += ' WHERE id=?';
  values.push(id);

  db.query(sql, values, (err) => {
    if (err) return handleError(res, err, 'Atualizar Prospect');
    res.json({ message: 'Atualizado com sucesso' });
  });
});

app.delete('/api/prospects/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM prospects WHERE id = ?', [id], (err) => {
        if (err) return handleError(res, err, 'Del Prospect');
        res.json({ message: 'Excluído' });
    });
});

// === ROTA CATCH-ALL (SPA) - BLINDADA COM REGEX (Correção Express 5) ===
// Em vez de '*', usamos um Regex /.*/ para evitar o erro "Missing parameter name"
app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return res.status(404).json({ message: 'Endpoint não encontrado' });
    }
    
    // Caminho absoluto para o index.html do frontend
    const indexPath = path.join(distDir, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <h1>Frontend não encontrado</h1>
                <p>O arquivo <code>dist/index.html</code> não foi encontrado.</p>
                <p>Certifique-se de executar <code>npm run build</code> no seu terminal antes de iniciar o servidor.</p>
            </div>
        `);
    }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando unificado em http://0.0.0.0:${PORT}`);
  console.log(`📂 Pasta dist: ${distDir}`);
  if (!fs.existsSync(distDir)) {
      console.warn(`⚠️  ATENÇÃO: Pasta 'dist' não encontrada. Execute 'npm run build' para gerar o frontend.`);
  }
});