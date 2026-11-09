import { useRef, useEffect } from "react";
import styles from './ErrorSummary.module.css'

function ErrorSummary({ errors }) {
    const summaryRef = useRef(null);

    useEffect(() => {
        summaryRef.current?.focus();
    }, [errors]);

    return (
        /* expose as a landmark for screen reader elements list access */
        <section key={JSON.stringify(errors)}  className={styles.container} ref={summaryRef} tabIndex="-1" aria-labelledby="error-summary-title">
            <h2 className={styles.heading} id="error-summary-title">
                {Object.keys(errors).length === 1
                    ? "There is a problem"
                    : `There are ${Object.keys(errors).length} problems`}.
            </h2>
            <ol className={styles.list}>
                {Object.entries(errors).map(([fieldId, message]) => (
                    <li key={fieldId}>
                        <a href={`#${fieldId}`}>{message}</a>
                    </li>
                ))}
            </ol>
        </section>
    );
}

export default ErrorSummary;