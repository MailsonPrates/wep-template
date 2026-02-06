<?php

namespace App\Modules\User\Traits;

use App\Common\Tools\Image;
use App\Core\Session;
use App\Modules\Admin\UserGroup\Services\Roles;
use App\Modules\Config\Menu\Services\MenuService;

/**
 * Class responsável por adicionar os dados o usuário logado ao objeto User
 */
trait UserData 
{
    public static function isLogged()
    {
        return Session::get("user_id") ? true : false;
    }

    public static function getData($key=null)
    {
        $is_logged = self::isLogged();

        if ( !$is_logged ) return [
            'is_logged' => $is_logged,
            'permissions' => [
                'page.login',
                'page.login.logout',
                'page.login.recovery',
                'page.login.recovery.update',
                'page.user.invite.signup',
                'page.user.invite'
            ]
        ];

        $data = Session::get("user_data") ?: [];

        if ( empty($data) ){
            $data = self::handleGetData();
            Session::set('user_data', $data);
        }

        return $data[$key] ?? $data;
    }

    public static function handleGetData()
    {
        $data = [];
        $getUser = self::get([
            'where' =>  [
                ['user_id', '=', Session::get("user_id")]
            ]
        ]);

        $userData = $getUser->data[0] ?? [];
        $user_group_id = $userData['user_group_id'];

        $userGroupData = Roles::getRolesByUserGroup($user_group_id); 

        $roles = $userGroupData['roles'] ?? "";
        $roles = explode(",", $roles);

        $data['firstname'] = $userData['firstname'];
        $data['lastname'] = $userData['lastname'];
        $data['username'] = $userData['username'];
        $data['email'] = $userData['email'];
        $data['created_at'] = date("d/m/Y", strtotime($userData['created_at']));
        $data['permissions'] = $roles;
        $data['nickname'] = $userData['nickname'];
        $data['profile_images'] = [
            'small' => Image::get($userData['profile_image'], 36, 36),
            'medium' => Image::get($userData['profile_image'], 200, 200)
        ];

        $data['user_group_name'] = $userGroupData['name'] ?? "";
        $data['menu'] = MenuService::getByUserPermission($user_group_id);
        $data['is_logged'] = true;

        return $data;
    }

    public static function updateSession()
    {
        $data = self::handleGetData();
        Session::set('user_data', $data);

        return $data;
    }
}