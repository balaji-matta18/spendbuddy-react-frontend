import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { fixMobileHeight } from "./utils/fixMobileHeight";

fixMobileHeight();

createRoot(document.getElementById("root")!).render(<App />);
