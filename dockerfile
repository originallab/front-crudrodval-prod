
FROM node:18-alpine AS builder
WORKDIR /app


COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline && \
    npm update react-scripts postcss tailwindcss --no-audit

COPY . .

RUN DISABLE_ESLINT_PLUGIN=true \
    GENERATE_SOURCEMAP=false \
    TAILWIND_MODE=build \
    npm run build

FROM nginx:1.25-alpine


COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY --from=builder /app/build /usr/share/nginx/html


RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]