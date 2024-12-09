import * as React from "react";
import { createRoot } from 'react-dom/client';
import App from "../components/App/App";
import "../../styles/index.css";

const root = createRoot(document.getElementById("content-area") as HTMLElement);
root.render(
  <App />
);
