import { User } from "../types/user.js";
import { user } from "../data/user.js";   

// Placeholder for user's bposts
export function renderUserbposts(user: User): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-4";

  // Show skeletons first
  for (let i = 0; i < 3; i++) {
    container.appendChild(renderUserPostSkeleton());
  }

  setTimeout(() => {
    container.innerHTML = "";

    if (!user.posts || user.posts.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No posts yet!";
      empty.className = "text-gray-400 text-center";
      container.appendChild(empty);
      return;
    }

    user.posts.forEach((post) => {
      const tweet = document.createElement("div");
      tweet.className = "p-4 bg-gray-900 rounded-md flex flex-col gap-2";

      const title = document.createElement("h3");
      title.textContent = post.title;
      title.className = "font-bold text-white text-lg";

      const subtitle = document.createElement("p");
      subtitle.textContent = post.subtitle;
      subtitle.className = "text-gray-300";

      const content = document.createElement("p");
      content.textContent = post.content;
      content.className = "text-gray-200";

      const imagesContainer = document.createElement("div");
      imagesContainer.className = "flex gap-2 overflow-x-auto";
      post.images.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "w-20 h-20 object-cover rounded-md border border-gray-600";
        imagesContainer.appendChild(img);
      });

      tweet.append(title, subtitle, content, imagesContainer);
      container.appendChild(tweet);
    });
  }, 1000);

  return container;
}
function renderUserPostSkeleton(): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "p-4 bg-gray-900 rounded-md flex flex-col gap-3 animate-pulse";

  card.innerHTML = `
    <div class="h-4 w-1/2 bg-gray-700 rounded"></div>
    <div class="h-3 w-3/4 bg-gray-700 rounded"></div>
    <div class="h-3 w-full bg-gray-700 rounded"></div>
    <div class="h-3 w-5/6 bg-gray-700 rounded"></div>
    <div class="flex gap-2 mt-1">
      <div class="w-20 h-20 bg-gray-700 rounded-md"></div>
      <div class="w-20 h-20 bg-gray-700 rounded-md"></div>
    </div>
  `;

  return card;
}
// Placeholder for user's replies
export function renderUserReplies(user: User): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-4";

  const reply = document.createElement("div");
  reply.className = "p-4 bg-gray-900 rounded-md";
  reply.textContent = `This is ${user.name}'s reply.`;
  container.appendChild(reply);

  return container;
}

// Placeholder for user's media posts
export function renderUserMedia(user: User): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-4";

  const media = document.createElement("div");
  media.className = "p-4 bg-gray-900 rounded-md";
  media.textContent = `This is ${user.name}'s media content.`;
  container.appendChild(media);

  return container;
}