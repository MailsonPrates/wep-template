import LoginForm from "./LoginForm";
import {LoginApi} from "api";
import { useState, useEffect } from "react";
import useReqToast from 'ui/useReqToast';
import { Link, useSearchParams } from "react-router";
import RecoveryMessage from "./recovery/RecoveryMessage";
import App from "app";

export default function Login(props){
 
    const showToast = useReqToast();
    let [searchParams] = useSearchParams();
    const hasRecoveryMessage = searchParams.get("recover");
    const email = searchParams.get("email") || "";

    const [status, setStatus] = useState("ready");
    const [password, setPassword] = useState("");
    const [keep, setKeep] = useState(true);
    const [user, setUser] = useState(email);
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        document.title = `Login | ${App.data("title", "Wep")}`
    }, [props.title]);


    const Core = {

        set: {
            keep: setKeep,
            user: setUser,
            password: setPassword
        },

        onInputChange: (e) => {
            const $input = e.target;
            const name = $input.name;
            const value = $input.value;

            Core.set[name](value);
        },

        handleSubmit: e => {
            const form = e.currentTarget;

            if (form.checkValidity() === false) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }

            if ( !user || !password ){
                setValidated(true);
                return;
            }
        
            setStatus('processing');
            
            Core.handleLogin({user, password, keep});
        },

        handleLogin: async (props) => {

            let login = await LoginApi.login({
                username: props.user,
                password: props.password,
                keep: props.keep
            });

            if ( login.error ) {

                showToast({
                    state: "error",
                    message: login.message
                })
                 
                setStatus("ready")

                return;
            }
        }
    }

    return (
        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-light">
            <div className={`w-100${status === "processing" ? ' full-loading' : ''}`}>
                <div className="mx-auto text-center" style={{maxWidth: 400}}>
                    <Link to="/">
                        <img src="/assets/images/logo.png" alt="Logo" style={{maxWidth: 140}} />
                    </Link>
                    <div className="my-4 text-center">
                        <h1 className="mb-0 h2">Acesse sua conta</h1>
                        <div className="text-secondary">
                            Ainda não tem um conta? <Link to="/cadastro" className="text-decoration-none">Crie sua conta aqui</Link>
                        </div>
                    </div>
                    {hasRecoveryMessage && <RecoveryMessage />}
                    <LoginForm
                        status={status}
                        user={user}
                        password={password}
                        keep={keep}
                        onInputChange={Core.onInputChange}
                        handleSubmit={Core.handleSubmit}
                        validated={validated}
                        />
                </div>
            </div>
        </div>
    );
}