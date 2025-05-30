# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app


COPY package.json package-lock.json* ./
RUN npm install --silent

COPY . .

RUN CI=true npm run build

FROM nginx:1.25-alpine


COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]