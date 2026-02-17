FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN if npm pkg get scripts.build | grep -qv null; then npm run build; fi

EXPOSE 3000

CMD ["sh", "-c", "if npm pkg get scripts.start | grep -qv null; then npm run start; elif npm pkg get scripts.dev | grep -qv null; then npm run dev; else echo 'No start/dev script found in package.json' && exit 1; fi"]
