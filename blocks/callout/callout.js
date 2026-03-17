export default function decorate(block) {
  // Handle 2-cell structure [label | content] — da.live authors use this pattern
  const rows = [...block.children];
  if (rows.length === 1) {
    const cells = [...rows[0].children];
    if (cells.length === 2) {
      const labelText = cells[0].textContent.trim();
      const contentCell = cells[1];
      rows[0].innerHTML = '';
      if (labelText) {
        const heading = document.createElement('h3');
        heading.textContent = labelText;
        rows[0].append(heading);
      }
      [...contentCell.childNodes].forEach((node) => rows[0].append(node));
    }
  }

  const variant = [...block.classList].find((c) => c !== 'callout' && c !== 'block');
  if (variant === 'cta') block.classList.add('callout-cta');
  if (variant === 'important') block.classList.add('callout-important');
}
