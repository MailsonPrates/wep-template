<?php

namespace App\Modules\Admin\UserInvite;

use Wep\Controller;
use Wep\Response;
use Wep\Router\Http\RouterHttpRequest;
use Wep\Security\RateLimiter;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\Services\Username;
use App\Modules\Admin\UserInvite\Services\UserInviteService;

/**
 * Convites. Admin: get, create, update (cancelar), delete, resend. Público (cadastro do convidado):
 * validate, registerUser, validateUsername, com limite de tentativas por IP.
 */
class UserInviteApi
{
    use Controller;

    /**
     * Rotas públicas (cadastro do convidado): limite de tentativas por IP.
     */
    private const PUBLIC_MAX_ATTEMPTS = 30;
    private const PUBLIC_DECAY = 900;

    /**
     * get(): lista; get({id}): um convite. Com o nome do grupo de cada convite.
     */
    public function get(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        $getUserInvite = $id
            ? UserInvite::find($id)
            : UserInvite::get(['orderBy' => ['user_invite_id', 'DESC']]);

        if ( $getUserInvite->error || empty($getUserInvite->data) ) return $response->json($getUserInvite);

        $invites = $id ? [$getUserInvite->data] : $getUserInvite->data;

        // nomes dos grupos em uma consulta (antes: uma consulta por convite)
        $groupIds = array_values(array_unique(array_column($invites, 'user_group_id')));
        $getUserGroups = UserGroup::get([
            'fields' => ['user_group_id', 'name'],
            'where' => [['user_group_id', 'in', $groupIds]]
        ]);
        $groupNames = array_column($getUserGroups->data ?? [], 'name', 'user_group_id');

        foreach( $invites as $index => $invite ){
            $invites[$index]['user_group_name'] = $groupNames[$invite['user_group_id']] ?? "";
        }

        $getUserInvite->data = $id ? $invites[0] : $invites;

        return $response->json($getUserInvite);
    }

    public function create(RouterHttpRequest $request, Response $response)
    {
        return $response->json(UserInviteService::create([
            'email' => trim((string) ($request->email ?? '')),
            'user_group_id' => (int) ($request->user_group_id ?? 0),
        ]));
    }

    /**
     * O único update permitido é cancelar um convite pendente: update({id, status: "cancelled"}).
     */
    public function update(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( ($request->status ?? '') !== 'cancelled' ){
            return $response->json(Response::error('Só é possível cancelar o convite'));
        }

        $invite = $id ? UserInvite::find($id) : null;

        if ( !$invite || $invite->error || empty($invite->data) ){
            return $response->json(Response::error('Convite não encontrado'));
        }

        if ( ($invite->data['status'] ?? '') !== 'pending' ){
            return $response->json(Response::error('Só convites pendentes podem ser cancelados'));
        }

        return $response->json(UserInvite::updateById($id, ['status' => 'cancelled']));
    }

    public function delete(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->id ?? 0);

        if ( !$id ) return $response->json(Response::error('Convite não encontrado'));

        return $response->json(UserInvite::deleteById($id));
    }

    public function resend(RouterHttpRequest $request, Response $response)
    {
        $id = (int) ($request->user_invite_id ?? 0);

        if ( $id <= 0 ) return $response->json(Response::error('Convite não encontrado'));

        return $response->json(UserInviteService::resend(['user_invite_id' => $id]));
    }

    public function validate(RouterHttpRequest $request, Response $response)
    {
        $limited = self::rateLimited($request, 'invite-validate');

        if ( $limited ) return $response->json($limited);

        [$invite, $error] = self::pendingInvite((string) ($request->token ?? ''));

        return $response->json($error ? Response::error($error) : Response::success());
    }

    /**
     * Cadastro pelo convite. O convite é reservado (pending → used) de forma atômica ANTES de
     * criar o usuário: duas requisições simultâneas com o mesmo token não criam duas contas.
     */
    public function registerUser(RouterHttpRequest $request, Response $response)
    {
        $limited = self::rateLimited($request, 'invite-register');

        if ( $limited ) return $response->json($limited);

        $token = (string) ($request->token ?? '');

        [$invite, $error] = self::pendingInvite($token);

        if ( $error ) return $response->json(Response::error($error));

        $claim = UserInvite::update([
            'fields' => ['status' => 'used'],
            'where' => [
                ['token', '=', $token],
                ['status', '=', 'pending']
            ]
        ]);

        if ( $claim->error || (int) ($claim->affected_rows ?? 0) !== 1 ){
            return $response->json(Response::error("Convite já foi utilizado"));
        }

        try {

            $registerUser = SaveUser::handle([
                'username' => (string) ($request->username ?? ""),
                'email' => $invite['email'] ?? "",
                'user_group_id' => $invite['user_group_id'] ?? "",
                'firstname' => (string) ($request->firstname ?? ""),
                'lastname' => (string) ($request->lastname ?? ""),
                'password' => (string) ($request->password ?? ""),
                'status' => 'ativado'
            ]);

        } catch (\Throwable $th) {
            $registerUser = Response::error($th->getMessage());
        }

        // falhou (ex.: username em uso, senha curta): devolve o convite para nova tentativa
        if ( $registerUser->error ){
            UserInvite::updateById($invite['user_invite_id'], ['status' => 'pending']);
        }

        return $response->json($registerUser);
    }

    public function validateUsername(RouterHttpRequest $request, Response $response)
    {
        $limited = self::rateLimited($request, 'invite-username');

        if ( $limited ) return $response->json($limited);

        try {
            Username::check($request->username ?? "");

            return $response->json(Response::success());

        } catch (\Throwable $th) {
            return $response->json(Response::error($th->getMessage()));
        }
    }

    /**
     * Convite pendente e dentro da validade.
     *
     * @return array{0: array|null, 1: string|null} [convite, mensagem de erro]
     */
    private static function pendingInvite(string $token): array
    {
        if ( !preg_match('/^[a-f0-9]{20,128}$/', $token) ) return [null, "Convite inválido"];

        $getInvite = UserInvite::get([
            'where' => [
                ['token', '=', $token]
            ],
            'limit' => 1
        ]);

        $invite = $getInvite->data[0] ?? null;

        if ( $getInvite->error || !$invite ) return [null, "Convite não encontrado"];

        if ( $invite['status'] !== 'pending' ){
            $messages = [
                'cancelled' => 'Convite cancelado',
                'used' => 'Convite já foi utilizado',
                'expired' => 'Convite expirado!'
            ];

            return [null, $messages[$invite['status']] ?? 'Convite inválido'];
        }

        if ( new \DateTime($invite['expire_at']) < new \DateTime('now') ) return [null, 'Convite expirou!'];

        return [$invite, null];
    }

    private static function rateLimited(RouterHttpRequest $request, string $action)
    {
        $limiter = RateLimiter::make();
        $key = "$action:" . $request->ip();

        if ( $limiter->tooManyAttempts($key, self::PUBLIC_MAX_ATTEMPTS) ){
            return Response::error("Muitas tentativas. Tente novamente mais tarde.", ['http_code' => 429]);
        }

        $limiter->hit($key, self::PUBLIC_DECAY);

        return null;
    }
}
