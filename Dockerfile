FROM alpine:latest AS prepped

WORKDIR /source

COPY . .

RUN rm -rf Dockerfile .dockerignore .git .github README.md

FROM nginx:alpine-slim

RUN rm -rf /usr/share/nginx/html/*

COPY --from=prepped /source /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]