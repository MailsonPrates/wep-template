import { visual } from "core/user";
import config from "core/config";

export const DEFAULT_LOGO = "/assets/images/logo.png";

/**
 * Logo do app: o enviado em Config > Visual (versão .webp do cache) ou o padrão do template.
 *   <Logo />  <Logo small />
 */
export default function Logo({ small = false, className = "" }) {
    const src = visual().logo || DEFAULT_LOGO;

    return (
        <img
            src={src}
            alt={config("name", "") || "Logo"}
            className={`brand-logo${small ? " brand-logo-sm" : ""} ${className}`}
        />
    );
}
