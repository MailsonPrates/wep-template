import Error from "./templates/error";

export default function Error404(){
    return Error({
        code: 404,
        description: 'Página não encontrada'
    });
}