# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json primero
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Instala `concurrently` globalmente para ejecutar múltiples procesos
RUN npm install -g concurrently

# Expón los puertos necesarios
EXPOSE 3000 5001

# Comando para iniciar el servidor y Next.js en modo desarrollo
CMD ["npx", "concurrently", "-k", "\"node backend/server.js &\"", "\"next dev -p 3000\""]


