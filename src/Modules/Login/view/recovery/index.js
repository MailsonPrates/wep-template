/*import {State} from "jeact";
import LoginApi from "api/login";
import Toast from "ui/toast";
import {CircleCheckIcon} from "ui/icons";

export default function Recovery(){

    /*
    const state = State({
        status: "ready",
        email: ""
    })

    const Core = {
        onInputChange: e => {
            let $input = $(e.target);
            let name = $input.attr("name");
            let value = $input.val();

            state.set(name, value);
        },

        onSubmitBtnClick: async () => {
            let stateData = state.get();
            let hasError = false;

            $(".form .is-required").each(function(){

                let name = $(this).attr("name");
                let value = stateData[name];

                if ( value ) return;

                $(this).addClass("is-invalid");
                hasError = true;
                return false;
            })

            if ( hasError ) return;

            state.set("status", "processing");

            let submit = await LoginApi.recovery({
                email: stateData.email
            });

            if ( submit.error ){
                state.set("status", "ready");
                return Toast({
                    state: "error",
                    content: submit.message
                })
            }

            state.set("status", "success");
        }
    }

    const Ui = {

        head: status => {

            let $content = $.span({
                key: "ready",
                html: "Informe o e-mail do seu cadastro para receber instruções para recuperar a senha"
            });

            if ( status == "success" ){
                $content = $.div({
                    key: "success",
                    class: "text-success text-center d-block",
                    html: [
                        $.span({
                            css: {"font-size": 70},
                            html: CircleCheckIcon()
                        }),
                        $.span({
                            class: "ms-2 fw-light fs-4 d-block",
                            css: {'line-height': '30px'},
                            html: "Você receberá instruções para redefinir a sua senha, caso exista um cadastro com esse e-mail"
                        })
                    ]
                })
            }

            return $.div({
                class: "fw-light fs-5 my-3",
                html: $content
            })
        },

        form: props => {

            let isProcessing = props.status == "processing";
            let isSuccess = props.status == "success";

            if ( isSuccess ) return;

            return $.div({
                class: "form mt-3",
                html: [
                    Ui.email(props.email),
                    $.div({
                        class: "mt-3",
                        html: [
                            $.span({
                                class: "btn btn-primary btn-lg fw-bold rounded-5 w-50"+(isProcessing ? " disabled" : ""),
                                html: isProcessing ? "Enviando..." : "Enviar",
                                click: Core.onSubmitBtnClick
                            })
                        ]
                    })
                ]
            })
        },

        email: email => $.div({
            class: "form-floating mb-2",
            html: [
                $.input({
                    class: "form-control is-required",
                    placeholder: "E-mail",
                    value: email,
                    name: "email",
                    change: Core.onInputChange,
                }),
                $.label({
                    html: "E-mail",
                    class: "text-secondary"  
                })
            ] 
        })
    }


    return state.render(({status, email}) => {
        return $.div({
            class: "position-absolute px-2 w-100 h-100 bg-light d-flex align-items-center justify-content-center",
            html: $.div({
                class: `border-light shadow-sm rounded-4 p-3 bg-white w-100${status == "processing" ? ' full-loading' : ''}`,
                css: {"max-width": 400},
                html: [
                    Logo(),
                    Ui.head(status),
                    Ui.form({email, status})
                ]
            })
        });
    })
      
}
      */