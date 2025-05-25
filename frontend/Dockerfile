FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Fix #1: Use npm install instead of npm ci since package-lock.json is missing
RUN npm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]