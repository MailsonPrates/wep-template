import { useToast } from 'ui/ToastContext';

const useReqToast = () => {

    const { addToast, removeToast } = useToast();
    const tyeAliases = {
        'error': 'danger',
        'success': 'success'
    }

    const showToast = ({ id, type = 'info', message, error, state, autoHide, duration = 3000 }) => {
        type = type || state || 'info';
        type = typeof error === 'boolean' ? (error ? 'error' : 'success') : type;
        message = message || (type === "error" ? "Houve um erro" : "Realizado com sucesso");
        type = tyeAliases[type] || 'info';

        id = id || `toast-${(new Date()).getTime()}`;

        addToast({
            id: id,
            type,
            message,
            duration,
            autoHide
        });

        return {
            remove: () => removeToast(id)
        }
    };

    showToast.remove = id => removeToast(id);

    return showToast;
};

export default useReqToast;

/*
    # USAGE

    const showToast = useReqToast();

    const handleShowToast = () => {
        return showToast({
            type: "danger",
            message: "aaaaa"
        });
    };

*/