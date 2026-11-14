import { Button } from "react-bootstrap";

export default function ErrorPage(props={}){

    const styles = {
        main: {
            padding: 20,
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

    return <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        }}>
        <div style={styles.main}>
            <div style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={styles.code}>{props.code}</div>
                <div style={styles.description}>{props.description}</div>
            </div>
            <div className="text-center">
                {props.goBackBtn ? <Button variant="primary" size="lg" className="w-50" onClick={() => window.location.href = "/"}>voltar</Button> : ""}
            </div>
        </div>
    </div>
}