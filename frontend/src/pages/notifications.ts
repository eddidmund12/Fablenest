import { renderHome } from "./home.js";
import { notifications } from "../data/notifications.js";

export function renderNotifications(): HTMLDivElement {

  const container = document.createElement("div");

  container.className = "p-4 flex flex-col gap-4 pb-28";

  // HEADER
  const header = document.createElement("div");
  header.className = "flex items-center justify-between gap-3";

  const backBtn = document.createElement("button");
  backBtn.innerHTML = `<i class="fa-solid text-[20px] text-white fa-arrow-left md:text-[28px]"></i>`;

  const title = document.createElement("h2");
  title.textContent = "Notifications";
  title.className = "text-xl text-white md:text-[24px]";

  header.append(backBtn, title);


  const list = document.createElement("div");
  list.className = "flex flex-col gap-2";

function getIcon(type: string) {

  switch (type) {

    case "like":
      return "fa-heart text-[30px] text-red-500 md:text-[36px]";

    case "reply":
      return "fa-reply text-[30px] fa-2x text-yellow-400 md:text-[36px]";

    case "follow":
      return "fa-user-plus text-[30px] fa-2x text-blue-400 md:text-[36px]";

    case "success":
      return "fa-circle-check text-[30px] fa-2x text-green-500 md:text-[36px]";

    default:
      return "fa-bell fa-2x text-[30px] text-gray-400 md:text-[36px]";
  }

}
notifications.forEach(n => {

  const item = document.createElement("div");

  item.className =
    "bg-gray-800 p-3 rounded flex gap-3";

  const avatar = document.createElement("img");
  avatar.src = n.avatar || "https://i.pravatar.cc/40";
  avatar.className = "w-10 h-10 rounded-full md:w-12 md:h-12";

  // right side
  const right = document.createElement("div");
  right.className = "flex flex-col flex-1";

  // top text
  const top = document.createElement("div");
  top.className = "text-[18px] text-white/80 md:text-[24px]";
  top.innerHTML =
    `<span class="font-semibold">${n.user}</span> ${n.text}`;

  
  // icon
  const icon = document.createElement("i");
  icon.className = `fa-solid ${getIcon(n.type)} ml-2`;
  const topAvatar = document.createElement("div");
  topAvatar.appendChild(avatar)
  topAvatar.appendChild(top)
 
  
  right.appendChild(topAvatar);

  // post preview (only if exists)
  if (n.postText) {

    const preview = document.createElement("div");

    preview.textContent = n.postText;

    preview.className =
      "text-[16px] text-gray-400 mt-1 md:text-[20px]";
 
    right.appendChild(preview);

  }

  item.append(icon, right);

  list.appendChild(item);

});
  container.append(header, list);

  // BACK
  backBtn.addEventListener("click", () => {

    const mainContent = document.getElementById("mainContent")!;

    mainContent.innerHTML = "";

    mainContent.appendChild(renderHome());

  });

  return container;
}