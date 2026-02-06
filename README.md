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