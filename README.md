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
php app install                               # pergunta banco e admin; cria tabelas, admin, o menu padrão
                                              # e compila o front (npm ci quando precisa + npm run prod)
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
Com o `wep/framework` 2.0.1 ou mais novo ele é opcional (`php -S localhost:8000` também funciona: o roteador
usa o caminho real da URL), mas continua recomendado.
No Apache, aponte o DocumentRoot para `public/`. No Nginx: `try_files $uri /index.php$is_args$args;`.

### Permissões

Toda página e API com o middleware `checkPermission` exige a permissão correspondente no grupo do usuário
(Admin > Grupo de usuários). Página sem permissão responde 403 e mostra "Acesso negado" dentro do layout,
sem executar a página; a navegação dentro do app confere a mesma regra antes de abrir a tela. A Home é
liberada para todo usuário logado.

### Front (React)

```
npm ci            # instala as versões exatas do package-lock.json
npm run dev       # build de desenvolvimento + watch (roda "php app update" quando um config/module.php muda)
npm run prod      # build de produção (antes roda `npm ci` se o node_modules faltar ou não bater com o lock)
npm run icons     # regera só o catálogo de ícones do menu
```

O React Compiler está ligado no build (`babel-plugin-react-compiler`): escreva componentes simples, sem
`useMemo`/`useCallback`/`React.memo` por desempenho.

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

As APIs geradas (`import { UserGroupApi } from "api"`) têm só os métodos declarados nas rotas do
`config/module.php` (o template não usa o CRUD automático). O payload chega ao controller como enviado:
`UserGroupApi.update({ id, name })` → `$request->id`, `$request->name`.

Chamadas à API (`App.request` e as APIs geradas, ex.: `UserGroupApi.get({ id })`) sempre resolvem com o corpo da
resposta: trate com `if (res.error) ...`. Sessão expirada (401) leva ao login e volta à página depois;
sem permissão (403) volta como `{error: true, http_code: 403, message}`.

### Aparência (Config > Visual)

Cores (botões, barra superior, título das páginas), fonte do Google Fonts (lista com os pesos certos ou
qualquer outro nome, só com o peso normal) e tamanho do título viram `public/assets/css/theme.css`
(variáveis do Bootstrap), gerado no servidor ao salvar e no `php app update`. A cor primária vale também
para links, foco dos campos e checkbox.

Imagens: logo, logo para fundo escuro (usado quando a barra superior é escura; sem ele vale o logo normal)
e favicon (geradas as versões PNG 32x32 e 180x180). Os originais ficam em `public/assets/images/logo/` e
`favicon/`; o site usa as versões do `Wep\ImageCache` em `public/assets/images/cache/`. Sem imagem
personalizada valem `public/assets/images/logo.png` e `favicon.png`. No front: `<Logo />`, `<Logo dark />`.

Fotos de perfil: o original fica guardado e a nav usa a versão `.webp` do cache.

### Ícones do menu

O painel oferece os ícones Outline do Heroicons 2 (`react-icons/hi2`) sem colocar a biblioteca no bundle: o
seletor baixa o catálogo só quando é aberto, o servidor grava o nome do ícone e entrega o desenho junto com
o menu na página (sem requisição extra).
