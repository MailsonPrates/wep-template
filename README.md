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
### Front (React)

```
npm ci            # instala as versões exatas do package-lock.json
npm run dev       # build de desenvolvimento + watch (roda "php app update" quando um config/module.php muda)
npm run prod      # build de produção (public/assets/view)
```

O `php app update` precisa rodar antes do primeiro build: ele gera em `storage/builds` as rotas e as APIs
que o front importa. O build gera `storage/builds/view-assets.build.php` (só os scripts do entrypoint;
as telas são carregadas sob demanda).

Imports por alias: `app`, `core`, `components`, `hooks`, `helpers`, `contexts`, `modules`, `api`, `route-maps`.

Chamadas à API (`App.request` e as APIs geradas, ex.: `UserApi.get(id)`) sempre resolvem com o corpo da
resposta: trate com `if (res.error) ...`. Sessão expirada (401) leva ao login e volta à página depois;
sem permissão (403) volta como `{error: true, http_code: 403, message}`.
