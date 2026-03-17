export default function decorate(block) {
  const variant = [...block.classList].find((c) => c !== 'callout' && c !== 'block');
  if (variant === 'cta') {
    block.classList.add('callout-cta');
  }
}
