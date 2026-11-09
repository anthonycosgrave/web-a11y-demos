import { BrowserRouter, Routes, Route } from "react-router-dom";
import ConfirmationPage from "./components/ConfirmationPage/ConfirmationPage.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
