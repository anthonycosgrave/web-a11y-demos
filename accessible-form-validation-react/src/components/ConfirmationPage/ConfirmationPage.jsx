import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ConfirmationPage.module.css";

function ConfirmationPage() {
    const focusRef = useRef(null);
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        document.title = "Account created";
        focusRef.current?.focus();
    }, []);

    return (
        <main tabIndex="-1" ref={focusRef}>
            <div className={styles.successBanner}>
                <h1>Account Created!</h1>
            </div>
            <p className={styles.verificationNotice}>
                A verification email has been sent to <strong>{email}</strong>. You must verify your account before you can use it.
            </p>
        </main>
    );
}

export default ConfirmationPage;