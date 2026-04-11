import { Post } from "../types/post.js";

type Listener = () => void;

class Store {
  private posts: Post[] = [];
  private bookmarks: Post[] = [];
  private listeners: Listener[] = [];

  // Initialize
  init(posts: Post[]) {
    this.posts = posts;
  }

  // Subscribe (like React re-render)
  subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  getPosts() {
    return this.posts;
  }

  getBookmarks() {
    return this.bookmarks;
  }

  // Actions
  likePost(id: number) {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return;

    post.likes++;
    this.notify();
  }

  unlikePost(id: number) {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return;

    post.likes--;
    this.notify();
  }

  toggleBookmark(post: Post) {
    const index = this.bookmarks.findIndex((p) => p.id === post.id);

    if (index === -1) {
      this.bookmarks.push(post);
    } else {
      this.bookmarks.splice(index, 1);
    }

    this.notify();
  }

  isBookmarked(id: number) {
    return this.bookmarks.some((p) => p.id === id);
  }
}

export const store = new Store();