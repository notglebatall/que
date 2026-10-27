import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { NewsPage } from "@/pages/news-page"
import "@/styles/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NewsPage />
  </StrictMode>,
)
