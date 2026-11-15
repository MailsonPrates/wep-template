<?php
 
namespace App\Modules\Admin\UserInvite;
 
use Wep\Controller;
use Wep\Response;
use App\Modules\Admin\UserGroup\UserGroup;
use App\Modules\User\Services\SaveUser;
use App\Modules\User\Services\Username;
use App\Modules\Admin\UserInvite\Services\UserInviteService;
use Wep\Api\InvalidPayloadException;
use Wep\Security\RateLimiter;

/**
 * Classe controller responsável por implementar métodos
 * que lidam com as requisições vindas do front
 */
class UserInviteApi
{
    use Controller;

    public function get($request, $response)
    {
        $getUserInvite = UserInvite::fromClient('get');

        if ( $getUserInvite->error || empty($getUserInvite->data) ) return $response->json($getUserInvite);

        // get(id) devolve um registro; get() devolve a lista
        $isSingle = !array_is_list($getUserInvite->data);
        $invites = $isSingle ? [$getUserInvite->data] : $getUserInvite->data;

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

        $getUserInvite->data = $isSingle ? $invites[0] : $invites;

        return $response->json($getUserInvite);
    }
 
    /**
     * Rotas públicas (cadastro do convidado): limite de tentativas por IP.
     */
    private const PUBLIC_MAX_ATTEMPTS = 30;
    private const PUBLIC_DECAY = 900;

    public function validate($request, $response, $userInvite = null)
    {
        if ( $limited = self::rateLimited($request, 'invite-validate') ) return $response->json($limited);

        [$invite, $error] = self::pendingInvite((string) ($request->token ?? ''));

        return $response->json($error ? Response::error($error) : Response::success());
    }

    /**
     * Cadastro pelo convite. O convite é reservado (pending → used) de forma atômica ANTES de
     * criar o usuário: duas requisições simultâneas com o mesmo token não criam duas contas.
     * Antes não havia verificação de status nem de validade (token usado/expirado criava contas)
     * e o cadastro gravava a coluna "active", que não existe.
     */
    public function registerUser($request, $response, $userInvite = null)
    {
        if ( $limited = self::rateLimited($request, 'invite-register') ) return $response->json($limited);

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

    public function validateUsername($request, $response)
    {
        if ( $limited = self::rateLimited($request, 'invite-username') ) return $response->json($limited);

        $username = $request->username ?? "";

        try {
            Username::check($username);

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

    private static function rateLimited($request, string $action)
    {
        $limiter = RateLimiter::make();
        $key = "$action:" . $request->ip();

        if ( $limiter->tooManyAttempts($key, self::PUBLIC_MAX_ATTEMPTS) ){
            return Response::error("Muitas tentativas. Tente novamente mais tarde.", ['http_code' => 429]);
        }

        $limiter->hit($key, self::PUBLIC_DECAY);

        return null;
    }

    public function create($request, $response)
    {
        try {
            $payload = UserInvite::clientPayload('create');
        } catch (InvalidPayloadException $e) {
            return $response->json(Response::error($e->getMessage()));
        }

        return $response->json(UserInviteService::create($payload['fields']));
    }

    public function resend($request, $response)
    {
        $data = $request->data();
        return $response->json(UserInviteService::resend($data));
    }

}