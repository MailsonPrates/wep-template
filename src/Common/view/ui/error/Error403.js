import ErrorPage from "ui/error/ErrorPage";

export default function Error403(){
    return <ErrorPage code="403" description="Acesso negado" goBackBtn={true} />
}