export type Post = {
  id: number
  title: string
  subTitle: string
  category: string
  author: string
  userName:string
  comment: number
  views: number
  createdAt: number
  likes:number
  content?: string;
  images?: string[];
  img: string;
  avatar:string;
}