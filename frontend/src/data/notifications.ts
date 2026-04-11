import { Notification } from "../types/notification.js";

export const notifications: Notification[] = [
  {
    id: 1,
    type: "like",
    user: "Daniel",
    avatar: "https://i.pravatar.cc/40?img=1",
    text: "liked your post",
    postText: "Learning TypeScript is actually fun",
    time: Date.now(),
    read: false,
  },

  {
    id: 2,
    type: "reply",
    user: "Grace",
    avatar: "https://i.pravatar.cc/40?img=2",
    text: "replied to your post",
    postText: "I agree with this",
    time: Date.now(),
    read: false,
  },

  {
    id: 3,
    type: "follow",
    user: "Michael",
    avatar: "https://i.pravatar.cc/40?img=3",
    text: "followed you",
    time: Date.now(),
    read: false,
  },

  {
    id: 4,
    type: "success",
    user: "",
    avatar: "",
    text: "Post uploaded successfully",
    postText: "My new post about Tailwind",
    time: Date.now(),
    read: false,
  }
];