import { createRoot } from "react-dom/client";

import "./assets/styles/apexTheme.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
