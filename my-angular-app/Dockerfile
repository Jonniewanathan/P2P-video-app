FROM node:22 as build
LABEL authors="Jonathan"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/my-angular-app /usr/share/nginx/html
COPY ./certs /etc/nginx/certs
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443 80
CMD ["nginx", "-g", "daemon off;"]
