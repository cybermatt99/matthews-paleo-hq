(function(){
  const buttons = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');

  function go(page, smooth = true){
    const target = document.getElementById('page-' + page);
    if(!target) return;
    pages.forEach(p => p.classList.toggle('active', p === target));
    buttons.forEach(b => b.classList.toggle('active', b.dataset.page === page));
    if(history.replaceState){
      history.replaceState(null, '', '#' + page);
    } else {
      window.location.hash = page;
    }
    window.scrollTo({top:0, behavior:smooth ? 'smooth' : 'auto'});
    document.title = page === 'home'
      ? 'Jurassic Matt | Dinosaurs, Fossils & Amateur Paleontology'
      : 'Jurassic Matt | ' + (document.querySelector('.nav-btn[data-page="' + page + '"]')?.textContent.trim() || page);
  }

  buttons.forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.setAttribute('role', 'link');
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', () => go(el.dataset.goto));
    el.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        go(el.dataset.goto);
      }
    });
  });

  const hash = location.hash.replace('#','');
  if(hash && document.getElementById('page-' + hash)){
    go(hash, false);
  }

  let count = Number(localStorage.getItem('jurassicMattVisits') || '0') + 1;
  localStorage.setItem('jurassicMattVisits', String(count));
  const counter = document.getElementById('visitCounter');
  if(counter) counter.textContent = String(count).padStart(7,'0');

  const year = document.getElementById('copyrightYear');
  if(year) year.textContent = new Date().getFullYear();
})();
