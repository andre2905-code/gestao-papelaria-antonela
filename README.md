# gestao-papelaria-antonela
Sistema de gestão de recursos da papelaria da antonela

## Para rodar o projeto siga os passos abaixo

### Configuração das variáveis de ambiente

1. Crie o arquivo `api/.env` e copie o conteúdo de `api/.env.example` para este arquivo. Se quiser, pode usar o próprio explorador de arquivos do seu Sistema Operacional. Caso queira usar o terminal, use os comandos sugeridos.

```sh
cd api/
cp .env.example .env
```

2. No arquivo `.env`, altere as credenciais abaixo conforme mostrado:

```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=papelaria_db
DB_USERNAME=admin
DB_PASSWORD=secret
```

3. Após isso, acesse o terminal e suba os containers Docker utilizando o comando abaixo:


```sh
docker compose up -d
```


Esse comando pega toda o setup docker configurado e coloca para rodar, fazendo assim com que o projeto fique acessível diretamente pelo seu navegador, sem necessidade de instalações extra.

### URLs

**Backend (API):** Ficará acessível através da URL `localhost:8000`

**Frontend (React):** Ficará acessível através da URL `localhost:5173`

## Setup Backend

Uma vez que você subiu o Docker e as duas URLs já estão acessíveis, é necessário que você rode as migrations, que são as tabelas do banco de dados e suas colunas (sem as migrations, o backend não será iniciado e o Laravel retornará um erro informando sobre a falta da tabela "sessions" no banco).

Para isso, em um terminal, execute o comando abaixo:

```sh
docker compose exec api php artisan migrate
```

- `docker compose` - Docker compose é a ferramenta Docker que permite rodar mais de um container ao mesmo tempo no projeto, de forma que consigam se comunicar e agir em conjunto (uma espécie de orquestrador)
- `exec` - Executa algum comando no "terminal do container"
- `php artisan migrate` - Comando do Laravel para subir as migrations no banco.
