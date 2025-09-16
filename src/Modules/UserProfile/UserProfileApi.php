<?php
 
namespace App\Modules\UserProfile;
 
use App\Core\Controller;
use App\Core\Session;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\User;
use App\Common\Tools\Upload;
use App\Core\Response;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class UserProfileApi
{
    use Controller;
 
    public function salvar($request, $response)
    {
        $user_id = Session::get("user_id");
        $firstname = $request->firstname;
        $lastname = $request->lastname;
        $nickname = $request->nickname;
        $password = $request->password;
        $has_image_update = filter_var($request->image_update, FILTER_VALIDATE_BOOLEAN);
        $has_image_remove = filter_var($request->image_remove, FILTER_VALIDATE_BOOLEAN);

        $getUser = User::get([
            'where' => [
                ["user_id", "=", $user_id]
            ]
        ]);

        if ( $getUser->error ) return $response->json($getUser);

        $user_data = $getUser->data[0];

        $is_no_email_flux = $user_data['no_email'] ?? true;

        try {

            $profile_image = $user_data['profile_image'];

            if ( $has_image_update ){

                $profile_image = $has_image_remove 
                    ? ""
                    : Upload::handle([
                    'directory' => "/profile/",
                    'prefix' => $user_id
                ]);
            }

            $save = SaveUser::handle([
                'no_email' => $is_no_email_flux,
                'user_id' => $user_id,
                'username' => $user_data['username'] ?? "",
                'email' => $user_data['email'] ?? "",
                'firstname' => $firstname,
                'lastname' => $lastname,
                'nickname' => $nickname,
                'password' => $password,
                'profile_image' => $profile_image
            ]);

            User::updateSession();
            
            return $response->json($save);

        } catch (\Throwable $th) {
            return $response->json(Response::error($th->getMessage()));
        }
    }

}