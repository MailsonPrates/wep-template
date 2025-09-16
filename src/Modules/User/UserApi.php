<?php
 
namespace App\Modules\User;

use App\Core\Controller;
use App\Core\Response;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class UserApi
{
  use Controller;

  public function register($request, $response)
  {
    $data = $request->all();
    $data['password'] = password_hash(html_entity_decode($data['password'], ENT_QUOTES, 'UTF-8'), PASSWORD_DEFAULT);

    /**
     * Verifica duplicidade
     */
    $email = $request->email;

    if ( !$email ) return $response->json(Response::error("E-mail inválido")); 

    $getUser = User::get([
        'filters' => [
            ['email', 'equal', $email]
        ]
    ]);

    if ($getUser->error ) return $response->json(Response::error("Houve um erro, tente mais tarde"));

    $users = $getUser->data;

    if ( count($users) ) return $response->json(Response::error("Esse e-mail já está cadastrado"));

    $create = User::create($data);

    return $response->json($create);
  }
}