import { posts } from "../data/posts.js"
import { Post } from "../types/post.js"

export function renderTrending(): HTMLDivElement {
  const container = document.createElement("div")
  container.classList.add("p-2", "flex", "flex-col", "gap-4")
  const titleContainer = document.createElement("div")
  titleContainer.classList.add("flex", "items-center", "gap-2")

  const title = document.createElement("h2")
  title.textContent = "Trending Now"
  title.classList.add("text-white/80", "text-[14px]", "whitespace-nowrap")

  const line = document.createElement("div")
  line.classList.add('bg-white/50', 'w-full', 'h-[1px]')
  
  const viewAll = document.createElement("div")
  viewAll.classList.add("flex", "items-center", "gap-2")
  const view = document.createElement("div")
  view.textContent = "View All"
  view.classList.add("text-[#a088e7]", "text-[14px]", "whitespace-nowrap")
  const arrow = document.createElement("div")
  arrow.textContent = ">"
  arrow.classList.add("text-white/50")

  viewAll.appendChild(view)
  viewAll.appendChild(arrow)
  
  titleContainer.appendChild(title)
  titleContainer.appendChild(line)
  titleContainer.appendChild(viewAll)
  container.appendChild(titleContainer)


  const cardsContainer = document.createElement("div")
  cardsContainer.classList.add("grid", "grid-cols-2", "gap-2", "auto-rows-fr")

  const trendingPosts: Post[] = [...posts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4)

  trendingPosts.forEach((post, index) => {
    const card = document.createElement("div")
    card.classList.add("bg-slate-900/80", "backdrop-blur-xl", "shadow-2xl" ,"rounded-2xl", "flex", "flex-col", "gap-2", "p-2", "h-full")
    const cardNUm = document.createElement("h4")
    const cardTtile = document.createElement("div")
    const cardContent = document.createElement("div")
    const cardCategory = document.createElement("div")
    const cardBody = document.createElement("div")
    const cardProfile = document.createElement("div")
    const cardStats = document.createElement("div")
    cardContent.classList.add("flex", "flex-col", "flex-1", "gap-1")
    cardCategory.innerHTML = post.category
    cardCategory.classList.add("uppercase", "text-gray-300", "font-bellefair", "text-[18px]", "text-center")
    cardNUm.innerHTML = `<Span class="text-lg text-gray-300 font-bold font-orbitron">${index + 1}</span>`
    
    cardProfile.classList.add("flex", "item-center", "gap-2")
    cardTtile.innerHTML = `
      <p class="text-gray-200 text-[16px] text-bold">${post.title} :</P>
      <p class="text-gray-300 text-[14px] mt-[2px]"> ${post.subTitle}</p> 
    `
    cardProfile.innerHTML = `
    <img src="${post.img}" class="h-8 w-8 rounded-full">
    <p class="text-gray-600 font-medium font-barlow text-gray-100">${post.author}</p>
    `
    cardProfile.classList.add("flex", "items-center", "gap-2")

    cardStats.innerHTML=`
    <p class="text-gray-500 text-sm"><i class="fa-solid fa-comment text-gray-400"></i> ${post.comment} </p>
    <p class="text-gray-500"><i class="fa-solid fa-chart-simple"></i> ${post.views}</p>
    `
    cardStats.classList.add("flex", "items-center", "gap-3", "mt-auto")

    cardBody.classList.add("flex", "gap-3", "flex-1")
    cardBody.appendChild(cardNUm);
    cardContent.appendChild(cardTtile)
    cardContent.appendChild(cardProfile)
    cardContent.appendChild(cardStats)
    cardBody.appendChild(cardContent)
    card.appendChild(cardCategory)
    card.appendChild(cardBody)
    cardsContainer.appendChild(card)
  })

  container.appendChild(cardsContainer)

  return container
}