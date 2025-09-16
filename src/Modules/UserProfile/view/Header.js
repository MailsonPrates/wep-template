import React, { createRef } from "react"
import isMobile from "core/is-mobile";

const imageSizeByDevice = isMobile() ? 80 : 200;
const imageSizeStyle = {height: imageSizeByDevice, width: imageSizeByDevice};

const Avatar = ({image, preview, firstname="", onClick}) => {

    const firstLetter = firstname && firstname[0].toUpperCase();

    return (
        <div className="profile-image-container pointer position-relative" onClick={onClick}>
            <div className="profile-image border bg-light" style={{borderRadius: "50%", ...imageSizeStyle}}>
                <AvatarImage image={image} preview={preview} firstLetter={firstLetter} />
            </div>
            <div className="profile-image-cover d-flex align-items-center justify-content-center fw-semibold h-100 position-absolute top-0 w-100 text-white" style={{
                background: "#6b54cfd4", borderRadius: "50%"
            }}>{image ? "Alterar foto" : "Adicionar foto"}

            </div>
        </div>
    )
}

const AvatarImage = ({image, preview, firstLetter}) => {

    if ( image || preview ){
        return <span className="img-thumbnails d-block" style={{
            borderRadius: "50%", 
            backgroundImage: `url(${image || preview})`,
            ...imageSizeStyle,
            backgroundSize: "cover",
            backgroundPosition: "center"
        }}></span>
    }

    return (
        <span className="d-flex align-items-center justify-content-center fw-bold h-100" style={{
            color: "#555", fontSize: '100px'
        }}>{firstLetter}</span>
    )
}

export default function Header({username, imageRef, image, firstname, apelido, fullname, createdAt, onRemoveImage, onImageChange}){

    return (
        <div className="mb-5 d-flex align-items-center">
            <div className="position-relative">
                <Avatar 
                    image={image} 
                    firstname={firstname} 
                    onClick={() => imageRef.current.click()} />
                {(image) && <div className="text-center fs-13 mt-2 pointer text-secondary" onClick={onRemoveImage}>Remover foto</div>}
            </div>
            <div className="ms-4">
                {username && <span className="px-2 bg-light d-inline-block rounded text-secondary">{username}</span>}
                <div className="fw-semibold fs-2">
                    {fullname + (apelido ? ` (${apelido})` : '')}
                </div>
                <div className="">Cadastrado desde {createdAt}</div>
            </div>
            <input
                ref={imageRef}
                type="file"
                name="profile_image"
                style={{top: "-2000px"}}
                className="border position-absolute bg-success"
                onChange={onImageChange} />
        </div>
    )
}