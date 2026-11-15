<?php
 
namespace App\Modules\User;
 
use Wep\Model;
use App\Modules\User\Traits\UserData;

/**
 * Classe model responsável por implementar métodos
 * com operações de banco de dados.
 * Métodos implícitos: get, create, update, delete
 **/
class User
{
   use Model;
   use UserData;
}