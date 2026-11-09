export const passwordRequirements = [
    "At least 8 characters",
    "A mixture of both uppercase and lowercase letters",
    "A mixture of letters and numbers"
    // "Include at least one special character, e.g., ! @ # ? ]"
];

export function validatePassword(password) {
    if (!password) {
        return "Enter a password.";
    }

    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#?$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLength || !hasLetter || !hasDigit || !hasSpecialChar) {
        return "Password does not meet requirements.";
    }

    return null;
}
