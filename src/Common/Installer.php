<?php

namespace App\Common;

use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\Services\Username;
use Wep\Engine\Installer as InstallerContract;
use Wep\Response;
use Wep\Router\RouteMap;

/**
 * Etapa da instalação do template (`php app install`): cria o grupo "Administrador", com todas as
 * permissões das rotas, e o primeiro usuário admin.
 */
class Installer implements InstallerContract
{
    public function questions(): array
    {
        return [
            'admin_name' => ['label' => 'Nome do administrador'],
            'admin_username' => ['label' => 'Usuário do administrador', 'default' => 'admin'],
            'admin_password' => ['label' => 'Senha do administrador (mínimo 8 caracteres)', 'secret' => true],
        ];
    }

    public function handle(array $answers)
    {
        $password = $answers['admin_password'] ?? '';

        if ( strlen($password) < SaveUser::MIN_PASSWORD_LENGTH ){
            return Response::error('A senha do administrador precisa ter pelo menos ' . SaveUser::MIN_PASSWORD_LENGTH . ' caracteres');
        }

        // valida o username antes de criar o grupo (uma falha depois deixaria um grupo órfão)
        try {
            Username::check($answers['admin_username'] ?? 'admin');
        } catch (\Throwable $e) {
            return Response::error($e->getMessage());
        }

        $group = UserGroup::create([
            'fields' => [
                'name' => 'Administrador',
                'roles' => implode(',', self::allRoles())
            ]
        ]);

        if ( $group->error ) return $group;

        $name = trim($answers['admin_name'] ?? '');
        $parts = preg_split('/\s+/', $name, 2);

        try {
            $admin = SaveUser::handle([
                'no_email' => true,
                'username' => $answers['admin_username'] ?? 'admin',
                'firstname' => $parts[0] ?? '',
                'lastname' => $parts[1] ?? '',
                'password' => $password,
                'user_group_id' => $group->last_id,
                'status' => 'ativado'
            ]);
        } catch (\Throwable $e) {
            return Response::error($e->getMessage());
        }

        return $admin;
    }

    /**
     * Todas as roles das rotas (definidas pelo hook AddRoleToRoutes no build).
     *
     * @return string[]
     */
    private static function allRoles(): array
    {
        $roles = [];

        foreach ( RouteMap::getRaw() as $methods ){
            foreach ( $methods as $route ){
                $role = $route['custom']['role'] ?? null;

                if ( $role ) $roles[$role] = true;
            }
        }

        return array_keys($roles);
    }
}
