export default function decorate(block) {
  const picture = block.querySelector(':scope > div:first-child picture');
  if (!picture) {
    block.classList.add('no-image');
  } else {
    // Hero image is LCP — load eagerly with high priority to avoid CLS
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }
}
