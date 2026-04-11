import { bookmarks } from "../data/bookmarks.js";
import { renderPostCard } from "../Component/category.js";
import { renderHome } from "./home.js";

let bookmarksContainer: HTMLDivElement | null = null;

export function renderBookmarks(): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "p-4 flex flex-col gap-4 pb-28 overflow-hidden";

  // -------------------------
  // HEADER: back arrow + title + menu
  // -------------------------
  const header = document.createElement("div");
  header.className = "flex items-center justify-between";

  // back arrow
  const backBtn = document.createElement("button");
  backBtn.innerHTML = `<i class="fa-solid fa-arrow-left text-white text-lg"></i>`;
  backBtn.className = "p-2 md:text-[28px]";
  backBtn.addEventListener("click", () => {
    // Go back to home page
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;
    mainContent.innerHTML = "";
    mainContent.appendChild(renderHome());
  });

  // title
  const title = document.createElement("h2");
  title.textContent = "Bookmarks";
  title.className = "text-xl text-white md:text-[28px]";

  // menu (3 dots)
  const menuWrapper = document.createElement("div");
  menuWrapper.className = "relative";
  const menuBtn = document.createElement("button");
  menuBtn.innerHTML = `<i class="fa-solid fa-ellipsis-vertical text-white text-xl md:text-[28px]"></i>`;
  menuBtn.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
  });
  menuWrapper.appendChild(menuBtn);

  // dropdown menu
  const dropdown = document.createElement("div");
  dropdown.className = "absolute right-0 mt-2 w-40 bg-[#1f1f2e] border border-gray-700 rounded shadow-lg hidden flex-col z-50 md:w-[250px]";
  
  const clearAll = document.createElement("button");
  clearAll.textContent = "Clear all bookmarks";
  clearAll.className = "text-white p-2 text-left hover:bg-gray-700 md:text-[24px]";
  clearAll.addEventListener("click", () => {
    bookmarks.splice(0, bookmarks.length); // clear array
    renderBookmarkPosts(); // refresh page
    dropdown.classList.add("hidden"); // hide dropdown
  });

  dropdown.appendChild(clearAll);
  menuWrapper.appendChild(dropdown);

  header.appendChild(backBtn);
  header.appendChild(title);
  header.appendChild(menuWrapper);

  container.appendChild(header);

  // -------------------------
  // Add a pull-to-refresh wrapper
  // -------------------------
  const refreshWrapper = document.createElement("div");
  refreshWrapper.className = "relative overflow-hidden mt-4";

  const refreshIndicator = document.createElement("div");
  refreshIndicator.className = "absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 border-4 border-t-indigo-500 border-gray-300 rounded-full opacity-0 transition-opacity";
  refreshWrapper.appendChild(refreshIndicator);

  // container for dynamic bookmark posts
  bookmarksContainer = document.createElement("div");
  bookmarksContainer.className = "flex flex-col gap-4";
  refreshWrapper.appendChild(bookmarksContainer);

  container.appendChild(refreshWrapper);

  // initial render
  renderBookmarkPosts();

  // attach pull-to-refresh listener
  attachPullToRefresh(refreshWrapper, refreshIndicator);

  return container;
}

function attachPullToRefresh(wrapper: HTMLDivElement, indicator: HTMLDivElement) {
  let startY = 0;
  let isPulling = false;

  wrapper.addEventListener("touchstart", (e) => {
    if (wrapper.scrollTop === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  });

  wrapper.addEventListener("touchmove", (e) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 50) {
      indicator.style.opacity = "1";
    }
  });

  wrapper.addEventListener("touchend", () => {
    if (!isPulling) return;
    isPulling = false;

    if (indicator.style.opacity === "1") {
      indicator.style.opacity = "1";
      indicator.classList.add("animate-spin");

      setTimeout(() => {
        indicator.classList.remove("animate-spin");
        indicator.style.opacity = "0";

        renderBookmarkPosts();
      }, 1000);
    }
  });
}

// -------------------------
// Refresh function for external calls
// -------------------------
export function refreshBookmarkPage() {
  if (!bookmarksContainer) return;
  renderBookmarkPosts();
}

// -------------------------
// Render posts inside bookmarks container
// -------------------------
function renderBookmarkPosts() {
  if (!bookmarksContainer) return;

  bookmarksContainer.innerHTML = "";

  // Show skeletons first
  for (let i = 0; i < 3; i++) {
    bookmarksContainer.appendChild(renderBookmarkSkeleton());
  }

  setTimeout(() => {
    bookmarksContainer!.innerHTML = "";

    if (bookmarks.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No bookmarks yet";
      empty.className = "text-gray-400 md:text-[24px]";
      bookmarksContainer!.appendChild(empty);
    } else {
      bookmarks.forEach((post) => {
        const postCard = renderPostCard(post);
        bookmarksContainer!.appendChild(postCard);
      });
    }
  }, 1000);
}

function renderBookmarkSkeleton(): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "bg-[#1f1f2e] rounded-2xl flex flex-col gap-4 p-4 border border-gray-700 animate-pulse";

  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-md bg-gray-700"></div>
        <div class="flex flex-col gap-2">
          <div class="h-3 w-24 bg-gray-700 rounded"></div>
          <div class="h-3 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>
      <div class="h-4 w-4 bg-gray-700 rounded"></div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="h-4 w-3/4 bg-gray-700 rounded"></div>
      <div class="h-3 w-1/2 bg-gray-700 rounded"></div>
    </div>
    <div class="flex gap-5">
      <div class="h-3 w-10 bg-gray-700 rounded"></div>
      <div class="h-3 w-10 bg-gray-700 rounded"></div>
      <div class="h-3 w-10 bg-gray-700 rounded"></div>
    </div>
  `;

  return card;
}