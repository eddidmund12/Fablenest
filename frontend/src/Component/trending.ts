// renderTrending.ts
import { posts } from "../data/posts.js"
import { Post } from "../types/post.js"

export function renderTrending(): HTMLDivElement {
  const container = document.createElement("div")
  container.className = "p-2 flex flex-col gap-4"

  // ── Section header ──
  const titleContainer = document.createElement("div")
  titleContainer.className = "flex items-center gap-3"

  const title = document.createElement("h2")
  title.textContent = "Trending Now"
  title.className = "text-gray-100 text-[13px] md:text-[15px] font-['DM_Serif_Display'] whitespace-nowrap tracking-wide"

  const line = document.createElement("div")
  line.className = "flex-1 h-px bg-white/[0.07]"

  const viewAll = document.createElement("div")
  viewAll.className = "flex items-center gap-1 cursor-pointer group whitespace-nowrap"
  viewAll.innerHTML = `
    <span class="text-[#7c6fef] text-[12px] md:text-[13px] font-['DM_Sans'] font-light
                 group-hover:text-[#a088e7] transition-colors duration-200">View All</span>
    <i class="fa-solid fa-arrow-right text-[10px] text-[#7c6fef]/60
              group-hover:text-[#7c6fef] group-hover:translate-x-0.5
              transition-all duration-200"></i>
  `

  titleContainer.appendChild(title)
  titleContainer.appendChild(line)
  titleContainer.appendChild(viewAll)
  container.appendChild(titleContainer)

  // ── Cards grid ──
  const cardsContainer = document.createElement("div")
  cardsContainer.className = "grid grid-cols-2 gap-2 auto-rows-fr"

  for (let i = 0; i < 4; i++) {
    cardsContainer.appendChild(renderTrendingSkeleton())
  }
  container.appendChild(cardsContainer)

  setTimeout(() => {
    cardsContainer.innerHTML = ""

    const trendingPosts: Post[] = [...posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 4)

    trendingPosts.forEach((post, index) => {
      const card = document.createElement("div")
      card.className =
        "relative bg-[#1a1a28] border border-white/[0.07] rounded-2xl " +
        "flex flex-col gap-3 p-3 h-full overflow-hidden cursor-pointer " +
        "hover:-translate-y-0.5 hover:border-white/[0.13] " +
        "hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] " +
        "transition-all duration-200 group"

      // rank number as subtle background watermark
      const rankWatermark = document.createElement("div")
      rankWatermark.className =
        "absolute -right-2 -top-3 font-['DM_Serif_Display'] text-[56px] " +
        "font-bold text-white/[0.04] leading-none select-none pointer-events-none"
      rankWatermark.textContent = `${index + 1}`

      // category pill
      const categoryEl = document.createElement("div")
      categoryEl.className =
        "self-start px-2 py-0.5 rounded-full " +
        "bg-[#7c6fef]/10 border border-[#7c6fef]/20 " +
        "text-[#a088e7] text-[10px] md:text-[11px] uppercase tracking-widest " +
        "font-['DM_Sans'] font-medium"
      categoryEl.textContent = post.category

      // body row: rank + content
      const body = document.createElement("div")
      body.className = "flex gap-2 flex-1"

      // rank badge
      const rankBadge = document.createElement("div")
      rankBadge.className =
        "flex-shrink-0 w-5 h-5 rounded-md bg-[#212134] border border-white/[0.07] " +
        "flex items-center justify-center mt-0.5"
      rankBadge.innerHTML = `
        <span class="text-[#7c6fef] text-[10px] font-bold font-['DM_Sans'] leading-none">
          ${index + 1}
        </span>
      `

      // content column
      const content = document.createElement("div")
      content.className = "flex flex-col flex-1 gap-2 min-w-0"

      // title + subtitle
      const titles = document.createElement("div")
      titles.innerHTML = `
        <p class="text-gray-200 text-[12px] md:text-[13px] font-medium font-['DM_Sans']
                  leading-snug line-clamp-1">${post.title}</p>
        <p class="text-[#9090a8] text-[11px] md:text-[12px] font-light font-['DM_Sans']
                  leading-snug line-clamp-2 mt-0.5">${post.subTitle}</p>
      `

      // author row
      const author = document.createElement("div")
      author.className = "flex items-center gap-1.5"
      author.innerHTML = `
        <img src="${post.img}" class="w-5 h-5 rounded-full object-cover border border-white/10 flex-shrink-0" />
        <span class="text-[#5c5c74] text-[11px] font-['DM_Sans'] truncate">${post.author}</span>
      `

      // stats row
      const stats = document.createElement("div")
      stats.className = "flex items-center gap-3 mt-auto"
      stats.innerHTML = `
        <span class="flex items-center gap-1 text-[#5c5c74] text-[11px] font-['DM_Sans']">
          <i class="fa-regular fa-comment text-[10px]"></i>
          ${post.comment}
        </span>
        <span class="flex items-center gap-1 text-[#5c5c74] text-[11px] font-['DM_Sans']">
          <i class="fa-solid fa-chart-simple text-[10px]"></i>
          ${post.views}
        </span>
      `

      content.appendChild(titles)
      content.appendChild(author)
      content.appendChild(stats)
      body.appendChild(rankBadge)
      body.appendChild(content)

      card.appendChild(rankWatermark)
      card.appendChild(categoryEl)
      card.appendChild(body)
      cardsContainer.appendChild(card)
    })
  }, 1000)

  return container
}

// ── Skeleton ──
function renderTrendingSkeleton(): HTMLDivElement {
  const card = document.createElement("div")
  card.className =
    "bg-[#1a1a28] border border-white/[0.07] rounded-2xl " +
    "flex flex-col gap-3 p-3 h-full"

  card.innerHTML = `
    <div class="h-4 w-14 bg-[#212134] rounded-full skel"></div>
    <div class="flex gap-2">
      <div class="w-5 h-5 bg-[#212134] rounded-md flex-shrink-0 skel"></div>
      <div class="flex flex-col gap-2 flex-1 min-w-0">
        <div class="h-3 w-full bg-[#212134] rounded skel"></div>
        <div class="h-3 w-3/4 bg-[#212134] rounded skel"></div>
        <div class="flex items-center gap-2 mt-1">
          <div class="w-5 h-5 bg-[#212134] rounded-full skel"></div>
          <div class="h-2.5 w-16 bg-[#212134] rounded skel"></div>
        </div>
        <div class="flex gap-3">
          <div class="h-2.5 w-8 bg-[#212134] rounded skel"></div>
          <div class="h-2.5 w-8 bg-[#212134] rounded skel"></div>
        </div>
      </div>
    </div>
  `

  return card
}