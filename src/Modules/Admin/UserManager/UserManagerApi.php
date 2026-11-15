<?php
 
namespace App\Modules\Admin\UserManager;
 
use Wep\Controller;
use Wep\Response;
use App\Modules\User\Services\UserService;
use App\Modules\User\User;
use Wep\Api\InvalidPayloadException;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class UserManagerApi
{
    use Controller;

    /**
     * get() lista os usuários; get(id) devolve a lista com um usuário (formato usado pela view).
     */
    public function get($request, $response)
    {
        try {
            $payload = User::clientPayload('get');
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        return $response->json(UserService::get(isset($payload['id']) ? ['user_id' => $payload['id']] : []));
    }

    public function delete($request, $response)
    {
        try {
            $payload = User::clientPayload('delete');
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        return $response->json(UserService::delete($payload['id']));
    }

    public function save($request, $response)
    {
        $data = $request->data();
        return $response->json(UserService::save($data));
    }

    public function resetPassword($request, $response)
    {
        $data = $request->data();
        return $response->json(UserService::resetPassword($data));
    }
 
}