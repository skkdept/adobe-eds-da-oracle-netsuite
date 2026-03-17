export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      // Normalize h4 column headings to h3 — columns are sub-sections of h2 context,
      // so h4 would skip a level and fail heading-order accessibility checks
      col.querySelectorAll('h4').forEach((h4) => {
        const h3 = document.createElement('h3');
        h3.id = h4.id;
        h3.className = h4.className;
        h3.innerHTML = h4.innerHTML;
        h4.replaceWith(h3);
      });
    });
  });
}
