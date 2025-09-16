<?php
 
namespace App\Modules\Admin\UserManager;
 
use App\Core\Controller;
use App\Modules\User\Services\UserService;
 
/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class UserManagerApi
{
    use Controller;

    public function get($request, $response)
    {
        $data = $request->data();
        return $response->json(UserService::get($data));
    }

    public function delete($request, $response)
    {
        $data = $request->data();
        return $response->json(UserService::delete($data));
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