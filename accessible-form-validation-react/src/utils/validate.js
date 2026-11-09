import { validatePassword } from "./passwordValidation";

export function validateForm(values) {
    // Basic validation
    const errors = {};
    if (!values.email) {
        errors.email = "Enter an email address.";
    } else if (!values.email.includes("@")) {
        errors.email = "Enter a valid email address.";
    }
    
    const passwordError = validatePassword(values.password);
    if (passwordError) {
        errors.password = passwordError;
    }

    return errors;
}
