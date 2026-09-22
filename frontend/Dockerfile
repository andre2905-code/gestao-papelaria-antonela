# ─────────────────────────────────────────────────────────────────────────────
# React Frontend — Desenvolvimento
# Node 20 com Vite dev server + HMR
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine

# ── Diretório de trabalho ─────────────────────────────────────────────────────
WORKDIR /app

# ── Copia apenas package.json primeiro (cache de layers) ─────────────────────
COPY package.json package-lock.json* ./

# ── Instala dependências ──────────────────────────────────────────────────────
RUN npm ci

# ── Copia o restante do código ────────────────────────────────────────────────
COPY . .

# ── Porta do Vite dev server ──────────────────────────────────────────────────
EXPOSE 5173

# ── Inicia o Vite em modo dev, escutando em 0.0.0.0 (necessário no Docker) ───
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
