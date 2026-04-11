import { posts } from "../data/posts.js";
import { Post } from "../types/post.js";
import { timeAgo } from "../utils/timeAgo.js";

export function renderCategory(categoryName: string): HTMLDivElement {
  const container = document.createElement("div");

  let filtered: Post[];
  if (categoryName === "all") {
    filtered = posts;
  } else {
    filtered = posts.filter((p) => p.category === categoryName.toLowerCase());
  }

  filtered.forEach((post) => {
    const card = document.createElement("div");
    const topCard = document.createElement("div");
    const authorImg = document.createElement("div");
    const authorName = document.createElement("div");
    const time = document.createElement("div");
    const cardTitle = document.createElement("div")
    const reaction = document.createElement("div")
    const bookmark = document.createElement("div")
    const topcardone =document.createElement("div")

    authorImg.innerHTML = `<img src="${post.img}" alt="${post.title}" class="h-10 w-10 rounded-md" />`;
    authorName.innerHTML = `
      <h4 class="text-gray-300 p-0 m-0 leading-0 text-[20px]">${post.author}</h4>
      <h5 class="text-gray-400 p-0 m-0 leading-[4px] text-[16px]">${post.userName}</h5>
    `;
    authorName.classList.add("flex", "flex-col");

    cardTitle.innerHTML = `
    <h3 class="text-gray-300 text-[28px]">${post.title}</h3>
    <h4 class="text-gray-400 text-[18px]">${post.subTitle}</h4>
    `
    time.innerHTML = `
      <i class="fa-solid fa-circle text-[6px] text-gray-400"></i>
      <span class="text-gray-500 text-[16px]">${timeAgo(post.createdAt)}</span>
    `;
    
    bookmark.innerHTML = `
    <i class="fa-regular fa-bookmark text-gray-400"></i>
    `
    bookmark.addEventListener("click", () => {
  const icon = bookmark.querySelector("i") as HTMLElement;

  if (icon.classList.contains("fa-regular")) {
    icon.classList.remove("fa-regular", "text-gray-400");
    icon.classList.add("fa-solid", "text-[#6366F1]");
    showBookmarkNotif("Added to bookmark");
  } 
  else {
    icon.classList.remove("fa-solid", "text-[#6366F1]");
    icon.classList.add("fa-regular", "text-gray-400");
    showBookmarkNotif("Removed from bookmark");
  }
});
    time.classList.add("flex", "items-center", "gap-[6px]")

    reaction.innerHTML = `
    <p class="text-gray-500 text-sm"><i class="fa-solid fa-comment text-gray-400"></i> ${post.comment} </p>
    <button id="likeBtn" class="flex items-center gap-1 text-gray-500"> <svg id="heart" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-100 transition-transform duration-200" viewBox="0 0 24 24">
      <defs> <linearGradient id="heartGradient" x1="0" y1="0" x2="1" y2="0"> <stop offset="0%" stop-color="#8B5CF6" />
        <stop offset="100%" stop-color="#6366F1" /> </linearGradient> </defs> <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        fill="transparent" stroke="currentColor" stroke-width="2"/> </svg> ${post.likes}
     </button>
    <p class="text-gray-500"><i class="fa-solid fa-chart-simple"></i> ${post.views}</p>
    `
    reaction.classList.add("flex", "gap-5")
    topcardone.classList.add("flex", "gap-4", "items-center");
    topCard.classList.add("flex", "items-center", "justify-between")
    topcardone.appendChild(authorImg)
    topcardone.appendChild(authorName)
    topcardone.appendChild(time)
    
    topCard.appendChild(topcardone)
    topCard.appendChild(bookmark)

    topCard.classList.add("flex", "flex-row", "gap-3", "items-center")

    card.appendChild(topCard);
    card.appendChild(cardTitle)
    card.appendChild(reaction)
    card.classList.add("bg-slate-900/80", "backdrop-blur-xl", "shadow-2xl" ,"rounded-2xl", "flex", "flex-col", "gap-4", "p-4", "h-auto")
    container.classList.add("flex", "flex-col", "gap-3", "px-2", "py-3")
    container.appendChild(card);

    setInterval(() => {
      time.querySelector("span")!.textContent = timeAgo(post.createdAt);
    }, 10000);
  });
  
  const bookmarkNotif = document.createElement("div");
bookmarkNotif.className = "fixed top-5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-sm px-4 py-2 rounded shadow-lg opacity-0 pointer-events-none transition-opacity duration-300";
document.body.appendChild(bookmarkNotif);


  function showBookmarkNotif(message: string) {
    bookmarkNotif.textContent = message;
    bookmarkNotif.classList.remove("opacity-0");
    bookmarkNotif.classList.add("opacity-100");

    setTimeout(() => {
      bookmarkNotif.classList.remove("opacity-100");
      bookmarkNotif.classList.add("opacity-0");
    }, 2000);
  }
  return container;
}