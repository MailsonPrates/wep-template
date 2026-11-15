export { useApi, useAction } from "./useApi";
export { default as useForm } from "./useForm";
export { useToast } from "components/toast/ToastContext";

/**
 * @deprecated use useToast(). Mantido para módulos de apps que ainda chamam useReqToast():
 * a assinatura é a mesma (showToast({type|state|error, message, autoHide})).
 */
export { useToast as useReqToast } from "components/toast/ToastContext";
