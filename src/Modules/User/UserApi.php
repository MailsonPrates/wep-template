<?php
 
namespace App\Modules\User;

use Wep\Controller;

/**
 * Módulo User: dados e serviços do usuário (Services/, Traits/UserData). Não expõe rotas próprias:
 * o cadastro pelo admin fica em Admin/UserManager e o perfil em UserProfile.
 */
class UserApi
{
    use Controller;
}
