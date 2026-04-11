export function toggleSidebar() {

const menuBtn = document.getElementById("menuBtn")!
const sidebar = document.getElementById("sidebar")!
const overlay = document.getElementById("overlay")!

  let open = false
  let startX = 0
  let endX = 0

  function openSidebar() {
    sidebar.classList.remove("-translate-x-full")
    overlay.classList.remove("opacity-0", "pointer-events-none")
    open = true
  }
  function closeSidebar() {
    sidebar.classList.add("-translate-x-full")
    overlay.classList.add("opacity-0", "pointer-events-none")
    open = false
  }
  document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.closest("#menuBtn")) {
    if (open) closeSidebar();
    else openSidebar();
  }
});
  overlay.addEventListener("click", closeSidebar)
  document.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX
  })
  document.addEventListener("touchmove", (e) => {
    endX = e.touches[0].clientX
  })
  document.addEventListener("touchend", () => {
    const diff = endX - startX
    if (diff > 70 && !open && startX < 50) {
      openSidebar()
    }
    if (diff < -70 && open) {
      closeSidebar()
    }
  })
}