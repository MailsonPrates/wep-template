import Error from "./templates/error";

export default function Error403(){
    return Error({
        code: 403,
        description: 'Acesso negado'
    });
}