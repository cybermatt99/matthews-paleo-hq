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

  function bindInternalLinks(root = document){
    root.querySelectorAll('[data-goto]').forEach(el => {
      if(el.dataset.bound === '1') return;
      el.dataset.bound = '1';
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
  }

  buttons.forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
  bindInternalLinks();

  const hash = location.hash.replace('#','');
  if(hash && document.getElementById('page-' + hash)) go(hash, false);

  let count = Number(localStorage.getItem('jurassicMattVisits') || '0') + 1;
  localStorage.setItem('jurassicMattVisits', String(count));
  const counter = document.getElementById('visitCounter');
  if(counter) counter.textContent = String(count).padStart(7,'0');

  const year = document.getElementById('copyrightYear');
  if(year) year.textContent = new Date().getFullYear();

  const galleryStyles = document.createElement('style');
  galleryStyles.textContent = `
    .real-gallery-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}
    .real-photo{aspect-ratio:4/3;border:3px ridge #8b6f49;background-repeat:no-repeat;background-size:400% 400%;background-color:#17110c;box-shadow:inset 0 0 12px #000;position:relative;overflow:hidden}
    .real-photo.featured{grid-column:span 2;grid-row:span 2;min-height:260px}
    .real-photo span{position:absolute;left:0;right:0;bottom:0;padding:7px 8px;background:linear-gradient(transparent,rgba(0,0,0,.88));color:#f0dfb9;font-size:12px;padding-top:24px}
    .album-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;margin-bottom:8px}
    .album-meta{color:var(--gold);font-size:13px;white-space:nowrap}
    .album-copy{max-width:850px;line-height:1.5}
    .home-trip-feature{display:grid;grid-template-columns:minmax(180px,1fr) 1fr;gap:14px;align-items:center}
    .home-trip-feature .real-photo{min-height:190px;background-size:400% 400%}
    @media(max-width:900px){.real-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.real-photo.featured{min-height:220px}.home-trip-feature{grid-template-columns:1fr}}
    @media(max-width:560px){.real-gallery-grid{grid-template-columns:1fr 1fr}.real-photo.featured{grid-column:span 2;grid-row:span 1;min-height:210px}}
  `;
  document.head.appendChild(galleryStyles);

  function photo(dataUrl, pos, caption, featured = false){
    const div = document.createElement('div');
    div.className = 'real-photo' + (featured ? ' featured' : '');
    div.style.backgroundImage = `url(${dataUrl})`;
    div.style.backgroundPosition = pos;
    const cap = document.createElement('span');
    cap.textContent = caption;
    div.appendChild(cap);
    return div;
  }

  fetch('images/gallery-sprite.b64')
    .then(r => {
      if(!r.ok) throw new Error('gallery image data unavailable');
      return r.text();
    })
    .then(raw => {
      const dataUrl = 'data:image/jpeg;base64,' + raw.trim();

      const homePanels = [...document.querySelectorAll('#page-home article.panel')];
      const photoPanel = homePanels.find(p => p.querySelector('h2')?.textContent.includes('Photos and Trips'));
      if(photoPanel){
        const body = photoPanel.querySelector('.panel-body');
        body.innerHTML = '<div class="home-trip-feature"><div id="homeKualoaPhoto"></div><div><div style="color:var(--gold);font-size:20px;font-weight:bold">Kualoa Ranch, Oahu</div><div class="small">December 2022</div><p class="small">A Jurassic filming-location stop during our Hawaii wedding and honeymoon trip. We dressed as Ellie Sattler and Robert Muldoon, and the rain did a very convincing job with the atmosphere.</p><div class="linkish" data-goto="gallery">View the photo albums »</div></div></div>';
        const mount = body.querySelector('#homeKualoaPhoto');
        mount.replaceWith(photo(dataUrl, '0% 0%', 'Kualoa Ranch, Oahu', false));
        bindInternalLinks(body);
      }

      const galleryGrid = document.querySelector('#page-gallery .grid');
      if(galleryGrid){
        galleryGrid.innerHTML = `
          <article class="panel span-12">
            <h2>Photo Gallery</h2>
            <div class="panel-body"><p>Trips, exhibits, fossil hunting, museums, and other dinosaur-related things worth keeping together.</p></div>
          </article>
          <article class="panel span-12" id="album-kualoa">
            <h2>Kualoa Ranch, Oahu</h2>
            <div class="panel-body">
              <div class="album-head"><div class="album-copy"><strong>Hawaii, December 2022</strong><br><span class="small">A visit to Kualoa Ranch during our wedding and honeymoon trip. We toured Jurassic filming locations dressed as Ellie Sattler and Robert Muldoon. It also rained while we were driving around the site, which was pretty hard to beat.</span></div><div class="album-meta">8 photos</div></div>
              <div class="real-gallery-grid" id="kualoaPhotos"></div>
            </div>
          </article>
          <article class="panel span-12" id="album-zootampa">
            <h2>ZooTampa: Dinos Alive!</h2>
            <div class="panel-body">
              <div class="album-head"><div class="album-copy"><strong>August 10, 2020</strong><br><span class="small">A very 2020 dinosaur outing, masks and all. ZooTampa's Dinos Alive! exhibit had life-size dinosaur models throughout the park.</span></div><div class="album-meta">6 photos</div></div>
              <div class="real-gallery-grid" id="zooPhotos"></div>
            </div>
          </article>`;

        const k = galleryGrid.querySelector('#kualoaPhotos');
        [
          ['0% 0%', 'Arielle and me in the misty valley', true],
          ['33.333% 0%', 'The valley in the rain'],
          ['66.667% 0%', 'T. rex set piece'],
          ['100% 0%', 'Raptor transport cage'],
          ['0% 33.333%', 'Jurassic filming-location overlook'],
          ['33.333% 33.333%', 'Rainy valley and tour vehicle'],
          ['66.667% 33.333%', 'Bone-field set area'],
          ['100% 33.333%', 'Valley photo together']
        ].forEach(([pos, cap, featured]) => k.appendChild(photo(dataUrl, pos, cap, !!featured)));

        const z = galleryGrid.querySelector('#zooPhotos');
        [
          ['0% 66.667%', 'August 2020, masks included', true],
          ['33.333% 66.667%', 'Dinos Alive! display'],
          ['66.667% 66.667%', 'Dinos Alive! display'],
          ['0% 100%', 'Hatching dinosaur egg'],
          ['33.333% 100%', 'Large prehistoric bird model'],
          ['66.667% 100%', 'Feathered theropod model']
        ].forEach(([pos, cap, featured]) => z.appendChild(photo(dataUrl, pos, cap, !!featured)));
      }
    })
    .catch(err => console.warn('Jurassic Matt gallery:', err));
})();