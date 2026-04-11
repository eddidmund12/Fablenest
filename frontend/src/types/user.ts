export type User = {

    name: string
    username: string
    avatar: string
    notifications: number
    followers:number
    following:number
    bio:string
    location:string
    joinDate:string
    posts?: Array<{ title: string; subtitle: string; category: string; content: string; images: string[] }>;
}