import React from "react";

export default function Error(props={}){

    const styles = {
        main: {
            padding: 20,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh"
        },
        code: {
            fontWeight: "bolt",
            fontSize: "6rem"
        },
        description: {
            color: '#bdbdbd',
            fontSize: 45,
            fontWeight: 500,
            maxWidth: 260,
            lineHeight: "40px",
            textAlign: "left",
            margin: "0 0 0 15px"
        }
    }

    return <div>
        <div style={styles.main}>
            <div style={styles.code}>{props.code}</div>
            <div style={styles.description}>{props.description}</div>
        </div>
    </div>
}