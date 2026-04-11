import { user } from "../data/user.js";
import { User } from "../types/user.js";

// Example: these would be your dynamic post components
import { renderUserbposts, renderUserReplies, renderUserMedia } from "../Component/userContent.js";

export function renderProfile(user: User): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "w-full max-w-2xl mx-auto text-white";

  container.innerHTML = `
    <div class="flex justify-center mt-4 bg-white/5 backdrop-blur-lg">
      <img src="${user.avatar}" class="w-36 h-36 rounded-full border-4 border-black object-cover" />
    </div>

    <!-- User Info -->
    <div class="mt-6 px-4">
      <h2 class="text-2xl font-bold md:text-[32px]">${user.name}</h2>
      <p class="text-gray-400 md:text-[22px]">@${user.username}</p>
      <p class="mt-2 text-gray-200 md:text-[22px]">${user.bio || ""}</p>
      <div class="flex gap-4 mt-2 text-gray-400 text-sm md:text-[22px]">
        <span><i class="fa-regular fa-calendar"></i> Joined ${user.joinDate}</span>
        ${user.location ? `<span><i class="fa-solid fa-location-dot"></i> ${user.location}</span>` : ""}
      </div>

      <!-- Follow Stats -->
      <div class="flex gap-6 mt-3 md:text-[22px]">
        <span><span class="font-bold text-white">${user.following}</span> Following</span>
        <span><span class="font-bold text-white">${user.followers}</span> Followers</span>
      </div>

      <!-- Tabs -->
      <div class="flex mt-4 border-b border-gray-600 md:text-[22px]">
        <button class="flex-1 py-2 text-center font-semibold hover:bg-gray-700 transition" data-tab="bposts">Posts</button>
        <button class="flex-1 py-2 text-center font-semibold hover:bg-gray-700 transition" data-tab="replies">Replies</button>
        <button class="flex-1 py-2 text-center font-semibold hover:bg-gray-700 transition" data-tab="media">Media</button>
      </div>
    </div>

    <!-- Main Content -->
    <div id="profile-content" class="px-4 mt-4">
      <!-- bposts/posts will render here -->
    </div>
  `;

  // ====== TAB INTERACTIONS ======
 const tabs = container.querySelectorAll<HTMLButtonElement>("button[data-tab]");
  const content = container.querySelector("#profile-content")!;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      content.innerHTML = ""; // clear previous content

      // Highlight active tab
      tabs.forEach(t => t.classList.remove("border-b-2", "border-white"));
      tab.classList.add("border-b-2", "border-white");

      // Render content based on tab
      const selected = tab.getAttribute("data-tab");
      if (selected === "Posts") {
        content.appendChild(renderUserbposts(user));
      } else if (selected === "replies") {
        content.appendChild(renderUserReplies(user));
      } else if (selected === "media") {
        content.appendChild(renderUserMedia(user));
      }
    });
  });

tabs[0]?.click();

  return container;
}