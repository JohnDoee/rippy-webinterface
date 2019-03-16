FROM node:10 as build

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

RUN npm run build -- --prod --output-path=/dist/


FROM nginx:1.15

RUN apt update && \
    apt install -y apache2-utils && \
    rm -rf /var/lib/apt/lists/*

RUN rm -f /etc/nginx/conf.d/*
COPY default.template /etc/nginx/conf.d/
COPY start-nginx.sh /
RUN chmod +x /start-nginx.sh

COPY --from=build /dist/ /usr/share/nginx/html

CMD ["bash", "/start-nginx.sh"]