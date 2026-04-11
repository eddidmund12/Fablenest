// postsRenderer.ts
import { posts } from "../data/posts.js";
import { Post } from "../types/post.js";
import { timeAgo } from "../utils/timeAgo.js";
import { bookmarks } from "../data/bookmarks.js";
import { refreshBookmarkPage } from "../pages/bookmarks.js";

let bookmarksContainer: HTMLDivElement | null = null;

export function renderPostCard(post: Post): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "post-card";
  const header = document.createElement("div");
  header.className = "post-card__header";

  const authorWrap = document.createElement("div");
  authorWrap.className = "post-card__author";
  authorWrap.innerHTML = `
    <img src="${post.avatar}" alt="${post.author}" class="post-card__avatar" />
    <div>
      <div class="post-card__author-name">${post.author}</div>
      <div class="post-card__username">${post.userName}</div>
    </div>
  `;

  const metaWrap = document.createElement("div");
  metaWrap.className = "post-card__meta";

  const timeEl = document.createElement("span");
  timeEl.className = "post-card__time";
  timeEl.textContent = timeAgo(post.createdAt);
  setInterval(() => { timeEl.textContent = timeAgo(post.createdAt); }, 10000);

  const bookmark = document.createElement("button");
  bookmark.className = "post-card__bookmark";
  bookmark.setAttribute("aria-label", "Bookmark");

  function updateBookmarkIcon() {
    const isBookmarked = bookmarks.some((p) => p.id === post.id);
    bookmark.innerHTML = isBookmarked
      ? `<i class="fa-solid fa-bookmark"></i>`
      : `<i class="fa-regular fa-bookmark"></i>`;
    bookmark.classList.toggle("is-bookmarked", isBookmarked);
  }
  updateBookmarkIcon();

  bookmark.addEventListener("click", (e) => {
    e.stopPropagation();
    const index = bookmarks.findIndex((p) => p.id === post.id);
    if (index === -1) {
      bookmarks.push(post);
      showBookmarkNotif("Bookmarked");
    } else {
      bookmarks.splice(index, 1);
      showBookmarkNotif("Removed");
      refreshBookmarkPage();
    }
    updateBookmarkIcon();
  });

  metaWrap.appendChild(timeEl);
  metaWrap.appendChild(bookmark);
  header.appendChild(authorWrap);
  header.appendChild(metaWrap);

  const body = document.createElement("div");
  body.className = "post-card__body";

  const textBlock = document.createElement("div");
  textBlock.className = "post-card__text";
  textBlock.innerHTML = `
    <div class="post-card__title">${post.title}</div>
    <div class="post-card__subtitle">${post.subTitle}</div>
  `;

  const thumb = document.createElement("img");
  thumb.src = post.img;
  thumb.alt = post.title;
  thumb.className = "post-card__thumb";

  body.appendChild(textBlock);
  body.appendChild(thumb);

  // ── Divider ──
  const divider = document.createElement("div");
  divider.className = "post-card__divider";

  // ── Footer ──
  const footer = document.createElement("div");
  footer.className = "post-card__footer";
  footer.innerHTML = `
    <button class="post-card__stat like-btn" id="likeBtn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          fill="transparent" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>${post.likes}</span>
    </button>
    <span class="post-card__stat">
      <i class="fa-regular fa-comment"></i>
      <span>${post.comment}</span>
    </span>
    <span class="post-card__stat">
      <i class="fa-solid fa-chart-simple"></i>
      <span>${post.views}</span>
    </span>
  `;

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(divider);
  card.appendChild(footer);

  card.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    openPostDetail(post);
  });

  return card;
}

function openPostDetail(post: Post) {
  const header = document.querySelector("#header") as HTMLElement;
  const footer = document.querySelector("#footer") as HTMLElement;
  const addPostBtn = document.querySelector("#addPostBtn") as HTMLElement;
  const mainContent = document.querySelector("#mainContent") as HTMLElement;

  if (header) header.style.display = "none";
  if (footer) footer.style.display = "none";
  if (addPostBtn) addPostBtn.style.display = "none";
  if (mainContent) mainContent.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  const overlay = document.createElement("div");
  overlay.className = "post-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "post-modal";

  const imagesHTML = post.images && post.images.length > 0
    ? `<div class="post-modal__images ${post.images.length > 1 ? "cols-2" : ""}">
        ${post.images.map((img: string) =>
          `<img src="${img}" class="post-modal__img" alt="post image" />`
        ).join("")}
       </div>`
    : "";

  modal.innerHTML = `
    <div class="post-modal__header">
      <div class="post-modal__author">
        <img src="${post.avatar}" class="post-modal__avatar" alt="${post.author}" />
        <div>
          <div class="post-modal__author-name">${post.author}</div>
          <div class="post-modal__username">${post.userName}</div>
        </div>
      </div>
      <div class="post-modal__close-wrap">
        <span class="post-modal__time-badge">${timeAgo(post.createdAt)}</span>
        <button id="closeModal" class="post-modal__close" aria-label="Close">&times;</button>
      </div>
    </div>

    <div class="post-modal__titles">
      <h2 class="post-modal__title">${post.title}</h2>
      <p class="post-modal__subtitle">${post.subTitle}</p>
    </div>

    <div class="post-modal__content">
      ${post.content || "No content available."}
    </div>

    ${imagesHTML}

    <div class="post-modal__stats">
      <span class="post-modal__stat">
        <i class="fa-regular fa-comment"></i> ${post.comment} comments
      </span>
      <span class="post-modal__stat">
        <i class="fa-regular fa-heart"></i> ${post.likes} likes
      </span>
      <span class="post-modal__stat">
        <i class="fa-solid fa-chart-simple"></i> ${post.views} views
      </span>
    </div>

    <div class="post-modal__comments">
      <p class="post-modal__comments-title">Comments</p>
      <div class="post-modal__input-row">
        <input
          id="commentInput"
          type="text"
          placeholder="Add a comment…"
          class="post-modal__input"
        />
        <button id="submitComment" class="post-modal__submit">Post</button>
      </div>
      <div id="commentsList" class="post-modal__comments-list"></div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const commentInput = modal.querySelector("#commentInput") as HTMLInputElement;
  const submitComment = modal.querySelector("#submitComment") as HTMLButtonElement;
  const commentsList = modal.querySelector("#commentsList") as HTMLDivElement;

  function addComment() {
    const text = commentInput.value.trim();
    if (!text) return;
    const comment = document.createElement("div");
    comment.className = "comment-item";
    comment.innerHTML = `
      <div class="comment-item__top">
        <span class="comment-item__author">You</span>
        <span class="comment-item__time">just now</span>
      </div>
      <p class="comment-item__text">${text}</p>
    `;
    commentsList.appendChild(comment);
    commentInput.value = "";
    comment.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  submitComment.addEventListener("click", addComment);
  commentInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addComment(); });

  function restoreUI() {
    if (header) header.style.display = "";
    if (footer) footer.style.display = "";
    if (addPostBtn) addPostBtn.style.display = "";
    if (mainContent) mainContent.style.overflow = "";
    document.body.style.overflow = "";
    overlay.remove();
  }

  overlay.addEventListener("click", (e) => { if (e.target === overlay) restoreUI(); });
  modal.querySelector("#closeModal")?.addEventListener("click", () => restoreUI());
}

export function renderCategory(categoryName: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-3 px-2 py-3";

  for (let i = 0; i < 4; i++) container.appendChild(renderSkeletonCard());

  setTimeout(() => {
    container.innerHTML = "";
    const filtered: Post[] =
      categoryName === "all"
        ? posts
        : posts.filter((p) => p.category === categoryName.toLowerCase());

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "posts-empty";
      empty.innerHTML = `<div class="posts-empty__icon">◦</div>No posts in this category`;
      container.appendChild(empty);
    } else {
      filtered.forEach((post) => container.appendChild(renderPostCard(post)));
    }
  }, 1000);

  return container;
}

function renderSkeletonCard(): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "skeleton-card";
  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="skel" style="width:38px;height:38px;border-radius:10px;"></div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div class="skel" style="width:96px;height:12px;"></div>
          <div class="skel" style="width:64px;height:10px;"></div>
        </div>
      </div>
      <div class="skel" style="width:14px;height:14px;border-radius:4px;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
      <div style="flex:1;display:flex;flex-direction:column;gap:7px;">
        <div class="skel" style="width:85%;height:16px;border-radius:5px;"></div>
        <div class="skel" style="width:60%;height:13px;border-radius:5px;"></div>
      </div>
      <div class="skel" style="width:80px;height:80px;border-radius:12px;flex-shrink:0;"></div>
    </div>
    <div style="display:flex;gap:16px;">
      <div class="skel" style="width:40px;height:11px;border-radius:4px;"></div>
      <div class="skel" style="width:40px;height:11px;border-radius:4px;"></div>
      <div class="skel" style="width:40px;height:11px;border-radius:4px;"></div>
    </div>
  `;
  return card;
}

export function renderBookmarkPosts() {
  if (!bookmarksContainer) return;
  bookmarksContainer.innerHTML = "";

  for (let i = 0; i < 3; i++) bookmarksContainer.appendChild(renderSkeletonCard());

  setTimeout(() => {
    bookmarksContainer!.innerHTML = "";
    if (bookmarks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "posts-empty";
      empty.innerHTML = `<div class="posts-empty__icon">◦</div>No bookmarks yet`;
      bookmarksContainer!.appendChild(empty);
    } else {
      bookmarks.forEach((post) => bookmarksContainer!.appendChild(renderPostCard(post)));
    }
  }, 800);
}

const bookmarkNotif = document.createElement("div");
bookmarkNotif.className = "bookmark-notif";
bookmarkNotif.innerHTML = `<div class="bookmark-notif__dot"></div><span></span>`;
document.body.appendChild(bookmarkNotif);

export function showBookmarkNotif(message: string) {
  const span = bookmarkNotif.querySelector("span")!;
  span.textContent = message;
  bookmarkNotif.classList.add("show");
  setTimeout(() => bookmarkNotif.classList.remove("show"), 2200);
}