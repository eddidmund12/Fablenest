export type Notification = {
  id: number;
  type: "like" | "reply" | "follow" | "success" | "welcome";
  user: string;
  avatar: string;
  text: string;
  postText?: string;
  time: number;
  read: boolean;
};