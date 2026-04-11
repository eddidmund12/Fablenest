window.addEventListener("DOMContentLoaded", () => {
  const likeBtn = document.getElementById("likeBtn") as HTMLButtonElement | null;
  const heartElement = document.getElementById("heart");
if (!heartElement || !(heartElement instanceof SVGSVGElement)) return;
const heart = heartElement;
  const heartPath = heart?.querySelector<SVGPathElement>("path");
  const likeCount = document.getElementById("likeCount") as HTMLSpanElement | null;

  if (!likeBtn || !heartPath || !likeCount) return;

  let liked = false;
  let count = parseInt(likeCount.textContent || "0", 10);

  likeBtn.addEventListener("click", () => {
    liked = !liked;

    heart.classList.add("scale-125");
    setTimeout(() => heart.classList.remove("scale-125"), 200);
    count += liked ? 1 : -1;
    likeCount.textContent = count.toString();
    heartPath.setAttribute("fill", liked ? "url(#heartGradient)" : "transparent");
  });
});
import { renderTrending } from './Component/trending.js';
import { renderCategory } from './Component/category.js';

const trendingDiv = document.getElementById("trending") as HTMLDivElement
const categoryDiv = document.getElementById("categoryContent") as HTMLDivElement


trendingDiv.appendChild(
  renderTrending()
)

categoryDiv.appendChild(
  renderCategory("all")
)

const forYouBtn = document.getElementById("forYou") as HTMLButtonElement;
const featuredBtn = document.getElementById("featured") as HTMLButtonElement;
const categoryContent = document.getElementById("categoryContent") as HTMLDivElement;

function setActive(button: HTMLButtonElement) {
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.classList.remove("border-indigo-500");
    btn.classList.add("border-transparent");
  });

  button.classList.remove("border-transparent");
  button.classList.add("border-indigo-500");
}

forYouBtn.addEventListener("click", () => {
  setActive(forYouBtn);

  categoryContent.innerHTML = "";
  categoryContent.appendChild(renderCategory("all"));
});

featuredBtn.addEventListener("click", () => {
  setActive(featuredBtn);

  categoryContent.innerHTML = "";
  categoryContent.appendChild(renderCategory("featured"));
});