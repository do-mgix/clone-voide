export function bindRevealOnScroll(selector) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.08 }
  );

  elements.forEach((element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition =
      'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, background-color 0.35s ease';
    observer.observe(element);
  });
}
