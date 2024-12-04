# Use uma imagem base do Python
FROM python:3.10

ENV PYTHONPATH=/app


# Diretório de trabalho
WORKDIR /app

# Instale as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie o código do backend
COPY . .

# Exponha a porta da aplicação
EXPOSE 5000

# Comando para iniciar o backend
CMD ["python", "app/app.py"]
