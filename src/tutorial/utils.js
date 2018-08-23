export function scrollTo(selector) {
  const pos = document.querySelector(selector)
                      .getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: pos,
    behavior: 'smooth'
  });
}