'use strict';
const search = document.querySelector('[data-search]');
const filter = document.querySelector('[data-filter]');
const rows = [...document.querySelectorAll('[data-requirement]')];
const count = document.querySelector('[data-count]');
const empty = document.querySelector('[data-empty]');
function update() {
  const query = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  for (const row of rows) {
    const matches = (filter.value === 'all' || row.dataset.kind === filter.value) && row.textContent.toLocaleLowerCase().includes(query);
    row.hidden = !matches;
    if (matches) visible += 1;
  }
  count.textContent = `${visible} of ${rows.length} assignment rows`;
  empty.hidden = visible > 0;
}
if (search && filter) {
  search.addEventListener('input', update);
  filter.addEventListener('change', update);
  window.addEventListener('hashchange', () => {
    if (document.getElementById(location.hash.slice(1))?.hidden) {
      search.value = '';
      filter.value = 'all';
      update();
    }
  });
}
