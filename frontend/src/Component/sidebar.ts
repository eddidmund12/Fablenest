import { User } from "../types/user.js"
import { renderBookmarks } from "../pages/bookmarks.js";
import { renderHome } from "../pages/home.js";
import {openNotifications} from "../Component/header.js"
import { renderProfile } from "../pages/profile.js";
import { user } from "../data/user.js";

export function renderSidebar(user: User): HTMLDivElement {

  const sidebar = document.createElement("div")

  sidebar.className =
    "h-full flex flex-col p-4 gap-4 text-white md:p-6"

  sidebar.innerHTML = `

  <div class="flex flex-col gap-3">

    <div class="flex items-center gap-3">
      <img src="${user.avatar}" class="w-10 h-10 rounded-full object-cover md:w-12 md:h-12">

      <div>
        <p class="font-bold md:text-[20px]">${user.name}</p>
        <p class="text-sm text-gray-400 md:text-[18px]">@${user.username}</p>
      </div>
    </div>
    <div class="flex gap-3">
      <div class="flex items-center gap-1">
        <p class="font-bold text-gray-200 text-[14px] md:text-[18px]">${user.following}</p>
        <p class="font-medium text-gray-400 text-[13px] md:text-[16px]">Following</p>
      </div>
      <div class="flex items-center gap-1">
        <p class="font-bold text-gray-200 text-[14px] md:text-[18px]">${user.followers}</p>
        <p class="font-medium text-gray-400 text-[13px] md:text-[16px]">Followers</p>
      </div>
    </div>
  </div>


  <div class="w-full h-[1px] bg-white/40"></div>


  <nav class="flex items-start flex-col gap-1 mt-4 ml-2 md:gap-2 ">
    <div class="flex gap-4 text-[28px] text-gray-200 items-center menuItem" id="profileMenu">
      <i class="fa-regular fa-user "></i>
      <p class="font-aeonik tracking-[1px]" > Profile </p> 
    </div>
    <div class="flex gap-4 text-[28px] text-gray-200 items-center menuItem" id="bookmarkMenu">
      <i class="fa-regular fa-bookmark "></i>
      <p class="font-aeonik tracking-[1px]" > Bookmark </p> 
    </div>
    <div class="flex gap-4 text-[28px] text-gray-200 items-center menuItem" id="sidebar-notification">
      <i class="fa-regular fa-bell "></i>
      <p class="font-aeonik tracking-[1px]" > Notification </p> 
    </div>
    <div class="flex gap-4 text-[28px] text-gray-200 items-center menuItem">
      <i class="fa-regular fa-circle-question "></i>
      <p class="font-aeonik tracking-[1px]" > Help </p> 
    </div>
    <div class="flex gap-4 text-[28px] text-gray-200 items-center menuItem">
      <i class="fa-solid fa-gear "></i>
      <p class="font-aeonik tracking-[1px]" > Settings </p> 
    </div>
  </nav>

  `
  const bookmarkMenu = sidebar.querySelector("#bookmarkMenu") as HTMLDivElement;

bookmarkMenu.addEventListener("click", () => {

  const mainContent = document.getElementById("mainContent")!;
  const staticPart = document.getElementById("static-part")!;

  mainContent.innerHTML = "";

  mainContent.appendChild(renderBookmarks());

  staticPart.style.display = "none";

});

  const sidebarNotification = sidebar.querySelector("#sidebar-notification") as HTMLDivElement;


sidebarNotification.addEventListener("click", () => {
  openNotifications(user); 
});
const profileMenu = sidebar.querySelector("#profileMenu") as HTMLDivElement;
const mainContent = document.getElementById("mainContent")!;
const staticPart = document.getElementById("static-part")!;

profileMenu.addEventListener("click", () => {
  mainContent.innerHTML = "";
  mainContent.appendChild(renderProfile(user));
  staticPart.style.display = "none"; 
});
  return sidebar
}