// renderHeader.ts
import { User } from "../types/user.js";
import { user } from "../data/user.js";
import { renderNotifications } from "../pages/notifications.js";

export function renderHeader(user: User): HTMLDivElement {
  const container = document.createElement("div");
  container.className =
    "flex justify-between items-center w-full px-4 py-2 " +
    "bg-[#0d0d14]/90 backdrop-blur-xl border-b border-white/[0.07] " +
    "sticky top-0 z-40 gap-3";

  const notifBadge =
    user.notifications > 0
      ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-semibold
                      min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center
                      border-[1.5px] border-[#0d0d14] leading-none animate-badge-pop">
           ${user.notifications}
         </span>`
      : "";

  container.innerHTML = `
    <!-- Left: avatar + brand -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <img
        src="${user.avatar}"
        id="menuBtn"
        alt="Profile"
        class="w-8 h-8 rounded-full object-cover cursor-pointer
               border-[1.5px] border-white/10
               hover:border-[#7c6fef] hover:scale-105
               transition-all duration-200"
      />
      <div class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" class="w-8 h-8 flex-shrink-0">
          <g transform="translate(10,10)">
            <path d="M 49 12 Q 20 45 44 88 L 48 88 L 48 30 Q 48 20 49 12 Z" fill="#F59E0B"/>
            <path d="M 51 12 Q 80 45 56 88 L 52 88 L 52 30 Q 52 20 51 12 Z" fill="#F59E0B"/>
            <path d="M 12 55 Q 50 105 88 55" fill="none" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
            <path d="M 5 45 Q 45 95 80 65"  fill="none" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
            <path d="M 20 65 Q 55 95 95 45" fill="none" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
          </g>
        </svg>
        <span class="font-['DM_Serif_Display'] text-[19px] text-gray-100 tracking-wide leading-none">
          FableNest
        </span>
      </div>
    </div>

    <!-- Right: search + bell -->
    <div class="flex items-center gap-2">

      <!-- Search pill — expands on focus -->
      <label class="header-search flex items-center gap-2
                    bg-[#1a1a28] border border-white/[0.07] rounded-full
                    px-3 py-[7px] cursor-text
                    transition-all duration-300 ease-in-out
                    w-9 focus-within:w-[120px] md:w-[180px] md:focus-within:w-[240px]
                    overflow-hidden focus-within:border-[#7c6fef]
                    focus-within:shadow-[0_0_0_3px_rgba(124,111,239,0.15)]">
        <i class="fa-solid fa-search text-[12px] text-[#5c5c74] flex-shrink-0
                  focus-within:text-[#7c6fef] transition-colors duration-200"></i>
        <input
          type="text"
          placeholder="Search stories…"
          class="bg-transparent border-none outline-none text-gray-200
                 text-[13px] font-light placeholder-[#5c5c74] w-full min-w-0
                 font-['DM_Sans']"
        />
      </label>

      <!-- Bell button -->
      <button
        class="header-bell relative flex items-center justify-center
               w-9 h-9 rounded-full flex-shrink-0
               bg-[#1a1a28] border border-white/[0.07]
               hover:bg-[#212134] hover:border-white/[0.13] hover:scale-105
               active:scale-95 transition-all duration-200
               cursor-pointer"
        aria-label="Notifications"
      >
        <i class="fa-solid fa-bell text-[14px] text-[#9090a8]
                  hover:text-gray-100 transition-colors duration-200"></i>
        ${notifBadge}
      </button>

    </div>
  `;

  // ── Event listeners (logic unchanged) ──
  const bellBtn = container.querySelector(".header-bell") as HTMLElement | null;
  if (bellBtn) {
    bellBtn.addEventListener("click", () => openNotifications(user));
  }

  return container;
}

// Shared function for header + sidebar notifications (unchanged)
export function openNotifications(user: User) {
  const mainContent = document.getElementById("mainContent");
  const staticPart = document.getElementById("static-part");

  if (!mainContent || !staticPart) return;

  staticPart.style.display = "none";
  mainContent.innerHTML = "";
  mainContent.appendChild(renderNotifications());

  user.notifications = 0;

  const headerBell = document.querySelector(".header-bell");
  if (headerBell) {
    const badge = headerBell.querySelector("span");
    if (badge) badge.remove();
  }
}

// Call this after the sidebar is rendered (unchanged)
export function attachSidebarNotification() {
  const sidebarBell = document.getElementById("sidebar-notification");
  if (sidebarBell) {
    sidebarBell.addEventListener("click", () => openNotifications(user));
  }
}