export default function Error(props={}){
    return $.div({
        html: $.div({
            css: {
                "padding": '20px',
                'text-align': 'center',
                "display": 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                "height": '100vH'
            },
            html: [
                $.div({
                    css: {
                        'font-weight': 'bold',
                        'font-size':' 6rem',
                    },
                    html: props.code
                }),
                $.div({
                    css: {
                        "color": '#bdbdbd',
                        'font-size': '45px',
                        'font-weight': '500',
                        'max-width': '260px',
                        'line-height': '40px',
                        'text-align': 'left',
                        "margin": '0 0 0 15px',
                    },
                    html: props.description
                })
            ]
        })
    })
}