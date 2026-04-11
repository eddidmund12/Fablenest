import { renderHeader } from "./Component/header.js";
import { renderSidebar } from "./Component/sidebar.js";
import { renderTrending } from "./Component/trending.js";
import { renderCategory } from "./Component/category.js";
import { toggleSidebar } from "./utils/toggleSidebar.js";
import { user } from "./data/user.js";
import { renderCreatePost } from "./pages/createPost.js"
import { renderHome } from "./pages/home.js";
import { posts } from "./data/posts.js";
import { store } from "./data/store.js"; 

store.init(posts);
store.subscribe(() => {
  document.body.innerHTML = ""; // or your root container
  const app = renderCategory("all");
  document.body.appendChild(app);
});
window.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("headerTop") as HTMLDivElement;
  headerContainer.appendChild(renderHeader(user));

  const sidebarContainer = document.getElementById("sidebar") as HTMLDivElement;
  sidebarContainer.appendChild(renderSidebar(user));
  toggleSidebar();

  const trendingDiv = document.getElementById("trending") as HTMLDivElement;
  trendingDiv.appendChild(renderTrending());

  const categoryDiv = document.getElementById("categoryContent") as HTMLDivElement;
  categoryDiv.appendChild(renderCategory("all"));

  const forYouBtn = document.getElementById("forYou") as HTMLButtonElement;
  const featuredBtn = document.getElementById("featured") as HTMLButtonElement;

  function setActive(button: HTMLButtonElement) {
    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("border-indigo-500");
      btn.classList.add("border-transparent");
    });
    button.classList.add("border-indigo-500");
  }

  setActive(forYouBtn);

  forYouBtn.addEventListener("click", () => {
    setActive(forYouBtn);
    categoryDiv.innerHTML = "";
    categoryDiv.appendChild(renderCategory("all"));
  });

  featuredBtn.addEventListener("click", () => {
    setActive(featuredBtn);
    categoryDiv.innerHTML = "";
    categoryDiv.appendChild(renderCategory("featured"));
  });
  const mainContent = document.getElementById("mainContent") as HTMLDivElement;
const createBtn = document.getElementById("createBtn") as HTMLDivElement;

createBtn.addEventListener("click", () => {
  // Hide header/footer/create btn
  header.style.display = "none";
  footer.style.display = "none";
  createBtn.style.display = "none";
  document.getElementById("static-part")!.style.display = "none";
  document.getElementById("homeBody")!.style.paddingTop = "10px";

  // Clear content
  mainContent.innerHTML = "";

  // ✅ call once
  const createPostDiv = renderCreatePost();

  // Attach cancel handler
  const cancelBtn = createPostDiv.querySelector("#cancelBtn") as HTMLButtonElement;
  const postBtn = createPostDiv.querySelector("#postBtn") as HTMLButtonElement;

  cancelBtn.addEventListener("click", () => {
    mainContent.innerHTML = "";
    mainContent.appendChild(renderHome());

    header.style.display = "flex";
    footer.style.display = "grid";
    createBtn.style.display = "flex";
    document.getElementById("static-part")!.style.display = "grid";
    document.getElementById("homeBody")!.style.paddingTop = "4rem";
  });
  postBtn.addEventListener("click", () => {
    mainContent.innerHTML = "";
    mainContent.appendChild(renderHome());

    header.style.display = "flex";
    footer.style.display = "grid";
    createBtn.style.display = "flex";
    document.getElementById("static-part")!.style.display = "grid";
    document.getElementById("homeBody")!.style.paddingTop = "4rem";
  });
  // append once
  mainContent.appendChild(createPostDiv);
});
  let lastScroll = 0;
  const footer = document.getElementById("mainFooter")!;
  const header = document.getElementById("header")!;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  if (currentScroll > lastScroll) {
    footer.style.transform = "translateY(100%)";
    createBtn.style.transform = "translateY(250%)";
    header.style.transform = "translateY(-100%)";
  } else {
    footer.style.transform = "translateY(0)";
    createBtn.style.transform = "translateY(0)";
    header.style.transform = "translateY(0)";
  }
  lastScroll = currentScroll;
});
});


// const app = document.getElementById("app") as HTMLDivElement
// createBtn.addEventListener("click", () => {

//   app.innerHTML = ""

//   app.appendChild(
//     renderCreatePost()
//   )

// })


// Get the floating "create" button
// const mainContent = document.getElementById("mainContent")!;
