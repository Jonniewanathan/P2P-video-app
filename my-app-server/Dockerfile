FROM node:22
LABEL authors="Jonathan"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY ./certs /app/certs
EXPOSE 5000
CMD ["npm", "run", "dev"]