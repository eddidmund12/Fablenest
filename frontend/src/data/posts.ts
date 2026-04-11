import { Post } from "../types/post"

export const posts: Post[] = [
  {
    id: 1,
    title: "Market Insights",
    subTitle: "Weekly Financial Review",
    category: "Finance",
    author: "Alex Moore",
    userName: "alexmo",
    comment: 200,
    views: 1057,
    img: "../img/game.webp",
    likes:843,
    createdAt: Date.now(),
    images: [
      "../img/game.webp",
      "../img/chart.webp"
    ],
    content: "This week the financial market experienced significant volatility due to global economic shifts...",
    avatar: "/img/dp.webp"
  },
  {
    id: 2,
    title: "The Decaf",
    subTitle: "The Drift Staggers",
    category: "Technology",
    author: "John Wilson",
    userName: "johnwil",
    comment: 150,
    views: 1717,
    img: "../img/game.webp",
    likes:943,
    createdAt: Date.now(),
    images: [
      "../img/game.webp",
      "../img/chart.webp"
    ],
    content: "This week the financial market experienced significant volatility due to global economic shifts...",
    avatar: "/img/dp.webp"
  },
  {
    id: 3,
    title: "Importing Wisht",
    subTitle: "Threatening AltMutant Tumps",
    category: "startups",
    author: "Mike Tee",
    userName: "miketee",
    comment: 90,
    views: 2057,
    img: "../img/game.webp",
    likes:823,
    createdAt: Date.now(),
    images: [
      "../img/game.webp",
      "../img/chart.webp"
    ],
    content: "This week the financial market experienced significant volatility due to global economic shifts...",
    avatar: "/img/dp.webp"
  },
  {
    id: 4,
    title: "Tech Trends",
    subTitle: "Catch the latest trend",
    category: "technology",
    author: "Sarah West",
    userName: "sawest",
    comment: 300,
    views: 3057,
    img: "../img/game.webp",
    likes:1043,
    createdAt: Date.now(),
    images: [
      "../img/game.webp",
      "../img/chart.webp"
    ],
    content: "This week the financial market experienced significant volatility due to global economic shifts...",
    avatar: "/img/dp.webp"
  }
]