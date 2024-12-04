import os

class Config:
    """Configurações gerais da aplicação"""

    # Chave secreta para proteger a sessão e os cookies
    # SECRET_KEY = os.environ.get('SECRET_KEY', 'uma-chave-secreta-aqui')

    # URL de conexão com o banco de dados MariaDB
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://user:password@localhost:3306/igreja_db')

    # Configuração para desabilitar o rastreamento de modificações do SQLAlchemy (recomendado para produção)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Defina a configuração para permitir uploads de arquivos
    UPLOAD_FOLDER = '/opt/files'

    # Outros parâmetros de configuração que você possa precisar
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Limita o tamanho dos uploads de arquivos a 16 MB

    # Outras variáveis de ambiente
    API_URL = os.environ.get('API_URL', 'http://localhost:5000')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

class DevelopmentConfig(Config):
    """Configurações específicas para o ambiente de desenvolvimento"""
    DEBUG = True

class ProductionConfig(Config):
    """Configurações específicas para o ambiente de produção"""
    DEBUG = False
    # Ajuste a chave secreta e outras variáveis para produção

class TestingConfig(Config):
    """Configurações específicas para o ambiente de testes"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL', 'mysql+pymysql://user:password@db_host:3306/test_db')
