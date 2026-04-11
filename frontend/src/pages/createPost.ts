const API_BASE = window.location.hostname === "127.0.0.1" || 
                 window.location.hostname === "localhost"
  ? "http://127.0.0.1:5000/api" 
  : "https://your-api.onrender.com/api";
  
import { renderHome } from "./home.js";


async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.image_url ?? null;
  } catch {
    return null;
  }
}

export function renderCreatePost(): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "p-4 flex flex-col gap-4 pb-28";

  // HEADER
  const header = document.createElement("h2");
  header.textContent = "Create Post";
  header.className = "text-xl font-semibold text-white";

  // CARD
  const card = document.createElement("div");
  card.className =
    "bg-[#111827] border border-gray-700 rounded-xl p-4 flex flex-col gap-4";

  // TITLE INPUT
  const titleInput = document.createElement("input");
  titleInput.placeholder = "Post title";
  titleInput.className =
    "p-3 rounded-lg bg-gray-800 text-white outline-none w-full";

  // SUBTITLE INPUT
  const subTitleInput = document.createElement("input");
  subTitleInput.placeholder = "Subtitle";
  subTitleInput.className =
    "p-3 rounded-lg bg-gray-800 text-white outline-none w-full";

  // CATEGORY SELECT
  const categoryWrapper = document.createElement("div");
  categoryWrapper.className = "flex flex-col gap-1";

  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Select Category";
  categoryLabel.className = "text-gray-300 text-sm";

  const categorySelect = document.createElement("select");
  categorySelect.className =
    "p-3 rounded-lg bg-gray-800 text-white outline-none w-full";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Select a category";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  categorySelect.appendChild(placeholderOption);

  const categories = ["Technology", "Finance", "Programming", "Startup", "News"];
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  categoryWrapper.append(categoryLabel, categorySelect);

  // IMAGE UPLOAD
  const imageLabel = document.createElement("label");
  imageLabel.textContent = "Choose Images";
  imageLabel.className =
    "cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg w-max inline-block";

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.multiple = true;
  imageInput.className = "hidden";
  imageLabel.appendChild(imageInput);

  // IMAGE PREVIEW
  const imagePreviewContainer = document.createElement("div");
  imagePreviewContainer.className = "flex gap-2 overflow-x-auto mt-2";

  const clearAllBtn = document.createElement("button");
  clearAllBtn.textContent = "Clear All";
  clearAllBtn.className =
    "text-xs text-red-500 mt-1 self-start px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 hidden";

  clearAllBtn.addEventListener("click", () => {
    imagePreviewContainer.innerHTML = "";
    imageInput.value = "";
    clearAllBtn.classList.add("hidden");
  });

  imageInput.addEventListener("change", () => {
    imagePreviewContainer.innerHTML = "";
    const files = imageInput.files;

    if (!files || files.length === 0) {
      clearAllBtn.classList.add("hidden");
      return;
    }

    clearAllBtn.classList.remove("hidden");

    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const imgWrapper = document.createElement("div");
      imgWrapper.className = "relative";

      const img = document.createElement("img");
      img.src = url;
      img.className = "w-20 h-20 object-cover rounded-lg border border-gray-600";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "×";
      removeBtn.className =
        "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center";

      removeBtn.addEventListener("click", () => {
        imgWrapper.remove();
        const dt = new DataTransfer();
        Array.from(imageInput.files!)
          .filter((_, i) => i !== index)
          .forEach((f) => dt.items.add(f));
        imageInput.files = dt.files;
        if (!imageInput.files || imageInput.files.length === 0) {
          clearAllBtn.classList.add("hidden");
        }
      });

      imgWrapper.append(img, removeBtn);
      imagePreviewContainer.appendChild(imgWrapper);
    });
  });

  // CONTENT
  const contentInput = document.createElement("textarea");
  contentInput.placeholder = "Write your post...";
  contentInput.className =
    "p-3 rounded-lg bg-gray-800 text-white outline-none h-40 resize-none w-full";

  // ERROR MESSAGE
  const errorMsg = document.createElement("p");
  errorMsg.className = "text-red-400 text-sm hidden";

  // BUTTONS
  const btnContainer = document.createElement("div");
  btnContainer.className = "flex gap-3 mt-2";

  const cancelBtn = document.createElement("button");
  cancelBtn.id = "cancelBtn";
  cancelBtn.textContent = "Cancel";
  cancelBtn.className =
    "flex-1 bg-gray-700 hover:bg-gray-600 transition p-3 rounded-lg text-white";

  const postBtn = document.createElement("button");
  postBtn.textContent = "Publish";
  postBtn.id = "postBtn";
  postBtn.className =
    "flex-1 bg-blue-600 text-gray-400 cursor-not-allowed transition p-3 rounded-lg";
  postBtn.disabled = true;

  btnContainer.append(cancelBtn, postBtn);

  // APPEND TO CARD
  card.append(
    titleInput,
    subTitleInput,
    categoryWrapper,
    imageLabel,
    imagePreviewContainer,
    clearAllBtn,
    contentInput,
    errorMsg,
    btnContainer
  );

  container.append(header, card);

  // ENABLE PUBLISH BUTTON WHEN VALID
  function validateForm() {
    const valid =
      titleInput.value.trim() &&
      subTitleInput.value.trim() &&
      categorySelect.value &&
      contentInput.value.trim();

    postBtn.disabled = !valid;
    if (valid) {
      postBtn.classList.remove("text-gray-400", "cursor-not-allowed");
      postBtn.classList.add("text-white", "cursor-pointer");
    } else {
      postBtn.classList.add("text-gray-400", "cursor-not-allowed");
      postBtn.classList.remove("text-white", "cursor-pointer");
    }
  }

  titleInput.addEventListener("input", validateForm);
  subTitleInput.addEventListener("input", validateForm);
  categorySelect.addEventListener("change", validateForm);
  contentInput.addEventListener("input", validateForm);

  // CANCEL
  cancelBtn.addEventListener("click", () => {
    navigateHome();
  });

  function navigateHome() {
    const mainContent = document.getElementById("mainContent")!;
    mainContent.innerHTML = "";
    mainContent.appendChild(renderHome());
    document.getElementById("header")!.style.display = "flex";
    document.getElementById("mainFooter")!.style.display = "flex";
    document.getElementById("createBtn")!.style.display = "flex";
  }

  function showError(msg: string) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
  }

  function hideError() {
    errorMsg.classList.add("hidden");
  }

  function showProgress(): { bar: HTMLDivElement; container: HTMLDivElement } {
    const progressContainer = document.createElement("div");
    progressContainer.className =
      "w-full h-1 bg-gray-700 rounded overflow-hidden fixed top-0 left-0 z-50";
    const progressBar = document.createElement("div");
    progressBar.className = "h-1 bg-blue-500 w-0 transition-all";
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    return { bar: progressBar, container: progressContainer };
  }

  function showToast(message: string, isError = false) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `fixed top-3 left-1/2 -translate-x-1/2 ${
      isError ? "bg-red-600" : "bg-indigo-600"
    } text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium transition-opacity duration-300`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // PUBLISH
  postBtn.addEventListener("click", async () => {
    hideError();
    postBtn.disabled = true;
    postBtn.textContent = "Publishing...";
    postBtn.classList.add("opacity-70", "cursor-not-allowed");

    const { bar: progressBar, container: progressContainer } = showProgress();

    try {
      progressBar.style.width = "30%";

      const payload = {
        title: titleInput.value.trim(),
        content: `**${subTitleInput.value.trim()}**\n\n${contentInput.value.trim()}`,
        category: categorySelect.value,
        image_url: null as string | null,
        video_url: null,
      };

      console.log("Sending payload:", payload);

      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      progressBar.style.width = "90%";

      console.log("Response status:", res.status);

      // Try to parse response body regardless of status
      const data = await res.json().catch(() => ({}));
      console.log("Response body:", data);

      if (res.status === 401) {
        throw new Error("You must be logged in to publish a post.");
      }

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      progressBar.style.width = "100%";

      setTimeout(() => {
        progressContainer.remove();
        navigateHome();
        showToast("Post published successfully!");
      }, 300);

    } catch (err: any) {
      console.error("Publish error:", err);
      progressContainer.remove();
      postBtn.disabled = false;
      postBtn.textContent = "Publish";
      postBtn.classList.remove("opacity-70", "cursor-not-allowed");
      validateForm();

      showError(err.message ?? "Something went wrong. Please try again.");
      showToast(err.message ?? "Something went wrong.", true);
    }
  });

  return container;
}