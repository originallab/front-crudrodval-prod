
FROM node:18-alpine AS builder
WORKDIR /app


COPY package.json package-lock.json ./


RUN npm install --frozen-lockfile --prefer-offline --no-audit

COPY . .


RUN CI=true GENERATE_SOURCEMAP=false npm run build


FROM nginx:1.25-alpine


COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY --from=builder /app/build /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]