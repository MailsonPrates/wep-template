# wep/project (template)

Template de apps WEP: backend em módulos PHP (`src/Modules`, namespace `App\`) sobre o Core
`wep/framework` (`../Wep`, namespace `Wep\`, ver o CLAUDE.md de lá) e front React em `src/app`.

## Validar uma mudança (sandbox)

```
npm run e2e            # sincroniza o sandbox, reinstala o banco, compila e roda os testes de navegador
npm run e2e -- --skip-build   # mudança só em PHP: não recompila o front
npm run sandbox serve  # sobe o sandbox em http://127.0.0.1:8766 (admin: maria / SenhaForte123)
npm run sandbox sync   # só copia o template para o sandbox
npm run sandbox clean  # apaga o sandbox e o banco
```

**Nunca apague `../sandbox` com `rm -rf`/`Remove-Item -Recurse`:** `vendor/wep/framework` e `node_modules`
lá dentro são links (junctions) para o Core e para o `node_modules` deste template; um delete recursivo
apagaria os originais. Use `npm run sandbox clean`, que remove os links antes.

O sandbox fica em `../sandbox` (fora dos repositórios): app instalada a partir deste template, com o
Core de `../Wep` ligado por path repo (mudanças no Core valem na hora) e o `node_modules` deste
template. Testes em `tests/e2e/run.js` (jsdom). Banco `wep_sandbox` no MySQL do XAMPP (root, sem senha);
variáveis em `tests/e2e/sandbox.js`. Mudança no Core: rode também a suíte Pest de lá.

## Mapa

| Área | Onde |
|---|---|
| Página HTML (injeta `window.App`: user, visual, forbidden) | `src/Common/Templates/Main.php` |
| Instalação (`php app install`: grupo admin, usuário, menu padrão) | `src/Common/Installer.php`, `database/schema.sql` |
| Login, sessão, rota inicial, "lembrar-me" | `src/Modules/Login` (`Services/Auth.php`, `Middlewares/IsLogged.php`), `LoginPersistent` |
| Dados do usuário logado (permissões e menu lidos do cache a cada requisição) | `src/Modules/User/Traits/UserData.php` |
| Grupos, permissões, `checkPermission` (API e página) | `src/Modules/Admin/UserGroup` (`Services/Roles.php`, `Middlewares/CheckPermission.php`, hooks do build) |
| Usuários, convites | `src/Modules/Admin/UserManager`, `src/Modules/Admin/UserInvite`, `src/Modules/User/Services` |
| Menu (ícones por catálogo) | `src/Modules/Config/Menu` (`Services/MenuService.php`, `MenuIcons.php`) |
| Visual: cores, fonte, título, logos, favicon | `src/Modules/Config/Visual` (`Services/Theme.php`, `Fonts.php`, `Logo.php`, `Favicon.php`, `BrandImage.php`, `Settings.php`) |
| Front: base | `src/app/core` (request, apiFactory, user/can, route/pageForPath), `hooks` (useApi, useAction, useForm, useToast), `components` |
| Front: estilos | `src/app/styles/main.scss` (Bootstrap do npm) → `public/assets/css/main.css` |
| Front: telas | `src/Modules/<Módulo>/view/*.js` (rotas em `config/module.php`) |
| Build | `webpack.config.js` (React Compiler no babel), `webpack/` (assets injetados, catálogo de ícones, watcher, `ensure-deps.js`) |

Gerados (não editar): `storage/builds/*` (`php app update`), `public/assets/view/`, `public/assets/css/main.css`
e `theme.css`, `public/assets/icons/hi2-outline.json` (`npm run icons`).

## Regras

- Módulo novo/alterado: `config/module.php` + `php app update`. Rotas com `method` vão para `<Módulo>Api.php`
  (parâmetros tipados `RouterHttpRequest $request, Response $response`). O template não usa o CRUD automático
  (`'methods'`): cada ação é uma rota declarada, com payload livre validado no controller. O `api` do módulo
  só guarda opções do Model (`primary_key`, `order_by`); o front nunca monta queries.
- Tabelas usadas com `DB::table()` têm o nome numa constante do `'constants'` do módulo (ex.: `TABLE_MENU_ITEMS`).
- Telas: `useApi` para carregar, `useAction` para salvar/remover, `useForm` + `Field` para formulários,
  `TemplateMain` como layout. Nada de `console.log`, de refs globais ou de concatenar texto do usuário em JS/CSS.
- Permissão: páginas e APIs com `checkPermission` exigem a role do grupo; a Home é liberada.
- Apps já instalados precisam de migration em `database/migrations/<versão>.sql` quando o schema muda
  (o `php app install` só roda `database/*.sql`).
- Versão no `composer.json` (`version`). Commits e README em português.
- Branches: trabalho na `develop`; release = merge `--no-ff` na `main` + tag anotada + push (só quando o
  usuário pedir). Depois do push, o Packagist do `wep/project` precisa de "Update" manual.

## Estilo de código (PHP e JS)

- Nada de atribuição dentro de condição. Em vez de `if ( $error = self::check($x) ) return ...;`, escreva:
  ```php
  $error = self::check($x);

  if ( $error ) return $response->json($error);
  ```
- Quebre linhas longas: chamadas e arrays com vários itens ficam um item por linha
  (`$m->action([` / `"a" => 1,` / `"b" => 2,` / `]);`). Sem exagero: chamadas curtas ficam numa linha.
- Front: o React Compiler está ativo no build. Escreva componentes simples, sem `useMemo`/`useCallback`/
  `React.memo` para performance (só quando a identidade estável for necessária por outro motivo).

## Ambiente (Windows)

- Antes de trocar para uma `main` antiga, confira se ela versiona arquivos hoje ignorados (`config/.env`,
  `.vscode/ftp-kr.json`): o merge apagaria as cópias locais.
- Prefira as ferramentas de arquivo a heredocs grandes no shell (o shell estraga `\` e blocos longos);
  `rm` com glob depois de `cd` é bloqueado (use caminhos absolutos).
