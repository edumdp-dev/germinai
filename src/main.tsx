import React from "react"
import ReactDOM from "react-dom/client"
import "@fontsource-variable/space-grotesk"
import "@fontsource-variable/geist"
import "@fontsource/jetbrains-mono/latin-400.css"
import "./styles.css"
import "./institute.css"
import "./layout.css"
import "./community.css"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>,
)
