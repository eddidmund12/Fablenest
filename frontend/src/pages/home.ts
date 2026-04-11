import { renderHeader } from "../Component/header.js"
import { renderSidebar } from "../Component/sidebar.js"
import { renderTrending } from "../Component/trending.js"
import { renderCategory } from "../Component/category.js"
import { user } from "../data/user.js"

export function renderHome(): HTMLDivElement {

  const container = document.createElement("div")

  container.innerHTML = `
    <div id="trending"></div>
    <div id="categoryContent"></div>
  `


  // header already exists in index.html
  const headerTop =
    document.getElementById("headerTop") as HTMLDivElement

  headerTop.innerHTML = ""
  headerTop.appendChild(renderHeader(user))


  const trending =
    container.querySelector("#trending") as HTMLDivElement

  trending.appendChild(renderTrending())


  const category =
    container.querySelector("#categoryContent") as HTMLDivElement

  category.appendChild(renderCategory("all"))


  return container
}