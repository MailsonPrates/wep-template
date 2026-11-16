<?php

namespace App\Modules\Admin\UserManager;

use Wep\Controller;
use Wep\Response;
use Wep\Router\Http\RouterHttpRequest;
use App\Modules\User\Services\UserService;

/**
 * Usuários (admin). O front envia o payload livre; o UserService escolhe e valida os campos.
 */
class UserManagerApi
{
    use Controller;

    /**
     * get(): lista os usuários; get({id}): a lista com um usuário (formato usado pela view).
     */
    public function get(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        return $response->json(UserService::get($id ? ['user_id' => $id] : []));
    }

    public function delete(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( !$id ) return $response->json(Response::error('Usuário não encontrado'));

        return $response->json(UserService::delete($id));
    }

    public function save(RouterHttpRequest $request, Response $response)
    {
        return $response->json(UserService::save($request->data()));
    }

    public function resetPassword(RouterHttpRequest $request, Response $response)
    {
        return $response->json(UserService::resetPassword([
            'user_id' => (int) ($request->user_id ?? 0),
        ]));
    }
}
