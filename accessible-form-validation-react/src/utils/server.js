export async function submitToServer(values) {

    // Simulate server
    await new Promise(resolve => setTimeout(resolve, 1300));

    if (values.email === "test@example.com") {
        return { email: "This email address is already registered." };
    }

    // Success - no errors
    return {};
}