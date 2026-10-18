const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const FOTOS_DIR = path.join(__dirname, 'public', 'fotos');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'formatura2027';

if (!process.env.ADMIN_PASSWORD) {
  console.warn('⚠️  ADMIN_PASSWORD não definida — usando a senha padrão "formatura2027". Defina uma em produção!');
}

// ---------- "Banco" em arquivo JSON ----------
fs.mkdirSync(DATA_DIR, { recursive: true });

function loadDb() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return { presencas: db.presencas || [], recados: db.recados || [] };
  } catch {
    return { presencas: [], recados: [] };
  }
}

let db = loadDb();

function saveDb() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// ---------- Helpers ----------
const clean = (v, max) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const cleanText = (v, max) => String(v ?? '').trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').slice(0, max);

// Limite simples por IP para evitar spam
const hits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length >= max) {
      return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo em alguns minutos.' });
    }
    list.push(now);
    hits.set(key, list);
    next();
  };
}

function requireAdmin(req, res, next) {
  const senha = req.get('x-admin-password') || req.query.senha || '';
  const a = Buffer.from(String(senha));
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  res.status(401).json({ erro: 'Senha incorreta.' });
}

function resumo() {
  const confirmados = db.presencas.filter((p) => p.colacao || p.festa);
  const pessoas = (p) => 1 + p.acompanhantes;
  return {
    confirmacoes: confirmados.length,
    colacao: confirmados.filter((p) => p.colacao).reduce((s, p) => s + pessoas(p), 0),
    festa: confirmados.filter((p) => p.festa).reduce((s, p) => s + pessoas(p), 0),
    vegetarianos: confirmados.filter((p) => p.festa && p.vegetariano).length,
  };
}

// ---------- App ----------
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Confirmação de presença
app.post('/api/presencas', rateLimit(8, 10 * 60 * 1000), (req, res) => {
  const nome = clean(req.body.nome, 80);
  const contato = clean(req.body.contato, 120);
  const colacao = Boolean(req.body.colacao);
  const festa = Boolean(req.body.festa);
  const acompanhantes = Math.max(0, Math.min(2, parseInt(req.body.acompanhantes, 10) || 0));
  const vegetariano = Boolean(req.body.vegetariano);
  const mensagem = cleanText(req.body.mensagem, 500);

  if (nome.length < 2) return res.status(400).json({ erro: 'Informe seu nome.' });
  if (req.body.site) return res.status(201).json({ ok: true }); // honeypot anti-robô

  // Se a mesma pessoa confirmar de novo, atualiza em vez de duplicar
  const chave = nome.toLowerCase();
  const existente = db.presencas.find((p) => p.nome.toLowerCase() === chave);
  const registro = { nome, contato, colacao, festa, acompanhantes, vegetariano, mensagem, atualizadoEm: new Date().toISOString() };

  if (existente) {
    Object.assign(existente, registro);
  } else {
    db.presencas.push({ id: crypto.randomUUID(), criadoEm: registro.atualizadoEm, ...registro });
  }
  saveDb();
  res.status(201).json({ ok: true, atualizado: Boolean(existente) });
});

// Mural de recados
app.get('/api/recados', (req, res) => {
  const recados = db.recados
    .filter((r) => !r.oculto)
    .map(({ id, nome, texto, criadoEm }) => ({ id, nome, texto, criadoEm }))
    .reverse();
  res.json(recados);
});

app.post('/api/recados', rateLimit(5, 10 * 60 * 1000), (req, res) => {
  const nome = clean(req.body.nome, 60);
  const texto = cleanText(req.body.texto, 600);
  if (req.body.site) return res.status(201).json({ ok: true });
  if (nome.length < 2) return res.status(400).json({ erro: 'Informe seu nome.' });
  if (texto.length < 2) return res.status(400).json({ erro: 'Escreva um recado.' });

  const recado = { id: crypto.randomUUID(), nome, texto, criadoEm: new Date().toISOString(), oculto: false };
  db.recados.push(recado);
  saveDb();
  res.status(201).json(recado);
});

// Galeria: lista as imagens de public/fotos (ordem alfabética)
app.get('/api/fotos', (req, res) => {
  let arquivos = [];
  try {
    arquivos = fs
      .readdirSync(FOTOS_DIR)
      .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  } catch {}
  res.json(
    arquivos.map((f) => ({
      src: '/fotos/' + encodeURIComponent(f),
      legenda: path.parse(f).name.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' '),
    }))
  );
});

// ---------- Admin ----------
app.get('/api/admin/presencas', requireAdmin, (req, res) => res.json({ resumo: resumo(), presencas: db.presencas }));

app.get('/api/admin/presencas.csv', requireAdmin, (req, res) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const linhas = [
    ['Nome', 'Contato', 'Vai à festa', 'Acompanhantes', 'Cardápio', 'Mensagem', 'Confirmado em'].map(esc).join(';'),
    ...db.presencas.map((p) =>
      [p.nome, p.contato, p.festa ? 'Sim' : 'Não', p.acompanhantes, p.vegetariano ? 'Vegetariano' : 'Normal', p.mensagem, p.atualizadoEm]
        .map(esc)
        .join(';')
    ),
  ];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="lista-de-presenca.csv"');
  res.send('﻿' + linhas.join('\n'));
});

app.delete('/api/admin/presencas/:id', requireAdmin, (req, res) => {
  db.presencas = db.presencas.filter((p) => p.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

app.get('/api/admin/recados', requireAdmin, (req, res) => res.json([...db.recados].reverse()));

app.patch('/api/admin/recados/:id', requireAdmin, (req, res) => {
  const recado = db.recados.find((r) => r.id === req.params.id);
  if (!recado) return res.status(404).json({ erro: 'Recado não encontrado.' });
  recado.oculto = Boolean(req.body.oculto);
  saveDb();
  res.json(recado);
});

app.delete('/api/admin/recados/:id', requireAdmin, (req, res) => {
  db.recados = db.recados.filter((r) => r.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`🎓 Site da formatura rodando em http://localhost:${PORT}`);
  console.log(`   Painel da lista de presença: http://localhost:${PORT}/admin`);
});
