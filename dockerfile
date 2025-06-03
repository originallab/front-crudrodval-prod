
FROM node:18-alpine AS builder
WORKDIR /app


COPY package.json package-lock.json ./


RUN npm ci --no-audit --prefer-offline && \
    npm update react-scripts postcss tailwindcss autoprefixer --no-audit

COPY . .


RUN DISABLE_ESLINT_PLUGIN=true \
    GENERATE_SOURCEMAP=true \  # Cambiado a true para debug
    INLINE_RUNTIME_CHUNK=false \
    TAILWIND_MODE=build \
    npm run build || (cat /app/build/errors.log && exit 1)


FROM nginx:1.25-alpine


COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY --from=builder /app/build /usr/share/nginx/html


RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;


HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
