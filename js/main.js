// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

// Dark mode (remembers your choice)
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch { return null; }
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme = getSavedTheme() || (prefersDark ? "dark" : "light");

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
});
