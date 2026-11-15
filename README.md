## App

### Comandos para mudar o DocumentRoot
Esses comandos servem para mudar o documentRoot do servidor de public_html para a pasta da sua aplicação.
Troque "username" pelo user do servidor e "gestor" para a pasta da sua aplicação.

#### 1) Porta 80 (HTTP) ####
sed -i 's|DocumentRoot /home/username/public_html|DocumentRoot /home/username/gestor/public|g' /etc/apache2/conf/httpd.conf

#### 2) Porta 443 (HTTPS) ####
sed -i 's|DocumentRoot /home/username/public_html|DocumentRoot /home/username/gestor/public|g' /etc/apache2/conf/httpd.conf

#### 3) Garantir permissões do diretório ####

chown -R username:www-data /home/username/gestor/public
chmod -R 755 /home/username/gestor
find /home/username/gestor/public -type f -exec chmod 644 {} \;

#### 4) Testar configuração do Apache ####
apachectl configtest

#### 5) Reiniciar o Apache ####
systemctl restart apache2
ou 
service apache2 restart
### Instalação

```
composer create-project wep/project meu-app   # já copia config/.env.example para config/.env
cd meu-app
php app install                               # pergunta banco e admin; cria tabelas, admin e o menu padrão
npm ci && npm run prod                        # build do front
```

Clonou pelo git? Copie o `.env` antes: `cp config/.env.example config/.env` (o `config/.env` não vai para o git).

Atualizando um app da 2.0.0: rode uma vez no banco `database/migrations/2.0.1.sql` (rota inicial dos grupos
e tabela `setting` do módulo Visual) e depois `php app update`.

### Rodar localmente

```
cd public
php -S localhost:8000 router.php
```

O `router.php` faz o papel do `.htaccess`, que o servidor embutido do PHP não lê. Ele só funciona no `php -S`.
No Apache, aponte o DocumentRoot para `public/`.

### Front (React)

```
npm ci            # instala as versões exatas do package-lock.json
npm run dev       # build de desenvolvimento + watch (roda "php app update" quando um config/module.php muda)
npm run prod      # build de produção
npm run icons     # regera só o catálogo de ícones do menu
```

O build gera:
- `public/assets/view/` — JS (as telas são carregadas sob demanda; `storage/builds/view-assets.build.php` lista só o entrypoint);
- `public/assets/css/main.css` — Bootstrap + estilos do app, compilados de `src/app/styles/main.scss`;
- `public/assets/icons/hi2-outline.json` — catálogo de ícones (Heroicons Outline) que o painel do Menu oferece.

O `php app update` precisa rodar antes do primeiro build: ele gera em `storage/builds` as rotas e as APIs
que o front importa.

Imports por alias: `app`, `core`, `components`, `hooks`, `helpers`, `contexts`, `modules`, `api`, `route-maps`.

Base do front (`src/app`):
- `hooks`: `useApi` (carregar dados), `useAction` (salvar/remover com toast e confirmação), `useForm` (campos e validação), `useToast`;
- `components`: `TemplateMain`, `TemplateClean`, `AuthPage`, `Field`, `Password`, `FormActions`, `ListState`, `LinkCards`, `Avatar`, `Logo`, `IconPicker`, `SvgIcon`.

Chamadas à API (`App.request` e as APIs geradas, ex.: `UserApi.get(id)`) sempre resolvem com o corpo da
resposta: trate com `if (res.error) ...`. Sessão expirada (401) leva ao login e volta à página depois;
sem permissão (403) volta como `{error: true, http_code: 403, message}`.

### Aparência (Config > Visual)

As cores dos botões e da barra superior viram `public/assets/css/theme.css` (variáveis do Bootstrap),
gerado no servidor ao salvar e no `php app update`. O logo enviado fica em `public/assets/images/logo/` e o
site usa uma versão WebP em `public/assets/images/cache/logo/`. Sem logo personalizado vale
`public/assets/images/logo.png`.

### Ícones do menu

O painel oferece os ícones Outline do Heroicons 2 (`react-icons/hi2`) sem colocar a biblioteca no bundle: o
seletor baixa o catálogo só quando é aberto, o servidor grava o nome do ícone e entrega o desenho junto com
o menu na página (sem requisição extra).
