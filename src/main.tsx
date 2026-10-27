import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";
import { applyTheme, savedTheme } from "./lib/theme";

applyTheme(savedTheme());
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
