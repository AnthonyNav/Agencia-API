# --- 1) Builder: instala deps y compila binarios nativos (mysql2) ---
FROM node:20-bullseye-slim AS builder

# Paquetes de compilación para mysql2 / node-gyp
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ pkg-config ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Solo package*.json para cache de capas
COPY package*.json ./

# Instala dependencias de producción (compila nativos aquí)
RUN npm ci --omit=dev

# Copia el código fuente
COPY src ./src

# --- 2) Runner: imagen final, sin toolchain ---
FROM node:20-bullseye-slim AS runner

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3001

# Crea usuario no-root
RUN useradd -m -u 10001 nodeapp

WORKDIR /app

# Copiamos sólo lo necesario desde el builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Opcional: menor ruido de npm
ENV NPM_CONFIG_LOGLEVEL=warn

# Healthcheck a /api/health (usa $PORT si Render te lo fija)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
    CMD node -e "require('http').get(`http://127.0.0.1:${process.env.PORT||3001}/api/health`, r=>{if(r.statusCode!==200)process.exit(1)}).on('error',()=>process.exit(1))"

EXPOSE 3001

# Usuario no-root
USER nodeapp

# En el arranque: migrar, seed y levantar API (scripts ESM que ya creaste)
CMD [ "sh", "-c", "node src/scripts/migrate.js && node src/scripts/seed.js && node src/index.js" ]
