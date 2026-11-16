/**
 * Foto do usuário ou a inicial do nome.
 *   <Avatar image={user.profile_images?.small} name={user.firstname} size={36} />
 */
export default function Avatar({ image, name = "", size = 36, className = "" }) {
    const initial = String(name || "").trim().charAt(0).toUpperCase();

    return (
        <span
            className={`nav-avatar ${className}`}
            style={{
                width: size,
                height: size,
                fontSize: Math.round(size * 0.42),
                backgroundImage: image ? `url("${String(image).replace(/["\\]/g, "")}")` : undefined,
            }}
            aria-hidden="true"
        >
            {!image && initial}
        </span>
    );
}
