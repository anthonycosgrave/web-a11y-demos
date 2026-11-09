import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validateForm } from "./utils/validate";
import { passwordRequirements } from "./utils/passwordValidation";
import ErrorSummary from "./components/ErrorSummary/ErrorSummary.jsx";
import PasswordInput from "./components/PasswordInput/PasswordInput.jsx";
import { submitToServer } from "./utils/server";
import "./App.css";

function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const hasErrors = Object.keys(errors).length > 0;
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const values = {email, password};
    const clientErrors = validateForm(values);
  
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }    
    
    const serverErrors = await submitToServer(values);
    if (Object.keys(serverErrors).length > 0) {
      setErrors(serverErrors);
    } else {
      navigate("/confirmation", { state: { email: values.email } });
    }
  }

  useEffect(() => {
      document.title = hasErrors ? "Error: Create an account" : "Create an Account";
  }, [hasErrors]);
  
  return (
    <main>
      <h1>Create an account</h1>
      {hasErrors && <ErrorSummary errors={errors} />}
      <form noValidate onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && ( 
            <div id="email-error">
              <svg aria-hidden="true" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              {errors.email}
            </div>
          )}
        </div>

          <PasswordInput 
            id="password"
            value={password}  
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            requirements={passwordRequirements}
          />

        <button className="blue" type="submit">
          Create account
        </button>
      </form>
    </main>
  );
}

export default App;