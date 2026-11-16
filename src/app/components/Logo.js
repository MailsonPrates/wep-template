import { visual } from "core/user";
import config from "core/config";

export const DEFAULT_LOGO = "/assets/images/logo.png";

/**
 * Logo do app: o enviado em Config > Visual (versão .webp do cache) ou o padrão do template.
 * Em fundo escuro, `dark` usa a variação para fundo escuro (sem ela, o logo normal).
 *   <Logo />  <Logo small />  <Logo dark />
 */
export default function Logo({ small = false, dark = false, className = "" }) {
    const settings = visual();
    const src = (dark && settings.logo_dark) || settings.logo || DEFAULT_LOGO;

    return (
        <img
            src={src}
            alt={config("name", "") || "Logo"}
            className={`brand-logo${small ? " brand-logo-sm" : ""} ${className}`}
        />
    );
}
