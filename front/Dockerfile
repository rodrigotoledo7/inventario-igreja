# Use uma imagem base do Node.js
FROM node:18

# Diretório de trabalho
WORKDIR /app

# Copie os arquivos do projeto
COPY package*.json ./
RUN npm install

# Copie o código da aplicação
COPY . .

# Construa a aplicação para produção
RUN npm run build

# Use uma imagem Nginx para servir a aplicação
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
