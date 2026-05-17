import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { bootstrapTheme } from "./lib/themeBootstrap";
import "./styles/theme.css";

const root = document.getElementById("root") as HTMLElement;

async function start() {
  await bootstrapTheme();
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void start();
