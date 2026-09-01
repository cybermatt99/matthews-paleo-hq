(function(){
  const buttons = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');

  function go(page, smooth = true){
    const target = document.getElementById('page-' + page);
    if(!target) return;
    pages.forEach(p => p.classList.toggle('active', p === target));
    buttons.forEach(b => b.classList.toggle('active', b.dataset.page === page));
    if(history.replaceState) history.replaceState(null, '', '#' + page);
    else window.location.hash = page;
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

  const albums = [
    {
      id:'kualoa',
      folder:'images/kualoa ranch 12-15-2022',
      title:'Kualoa Ranch, Oahu',
      date:'December 15, 2022',
      place:'Oahu, Hawaii',
      description:'Arielle and I visited Kualoa Ranch during our Hawaii wedding and honeymoon trip. We toured Jurassic filming locations, saw several dinosaur-themed stops and set pieces, and got a very rainy day in the valley.',
      featured:true,
      featureFirst:true
    },
    {
      id:'dinos-unearthed',
      folder:'images/dinos unearthed 2-27-2025',
      title:'Dinos Unearthed',
      date:'February 27, 2025',
      place:'',
      description:'Photos from a visit to Dinos Unearthed in February 2025.'
    },
    {
      id:'jurassic-quest',
      folder:'images/jurassic quest 7-21-2024',
      title:'Jurassic Quest',
      date:'July 21, 2024',
      place:'',
      description:'Photos from Jurassic Quest in July 2024.'
    },
    {
      id:'prehistoric-predators',
      folder:'images/prehistoric predators zoo tampa',
      title:'ZooTampa: Prehistoric Predators',
      date:'2024',
      place:'Tampa, Florida',
      description:'ZooTampa\'s Prehistoric Predators exhibit ran from January 13 through April 28, 2024. These are photos from our visit during that run.'
    },
    {
      id:'dinosaur-world',
      folder:'images/dinosaur world plant city fl 04-27-2021',
      title:'Dinosaur World',
      date:'April 27, 2021',
      place:'Plant City, Florida',
      description:'A visit to Dinosaur World in Plant City, Florida.'
    },
    {
      id:'dinos-alive',
      folder:'images/dinos alive 8-10-2020',
      title:'ZooTampa: Dinos Alive!',
      date:'August 10, 2020',
      place:'Tampa, Florida',
      description:'A very 2020 dinosaur outing, masks included. ZooTampa\'s Dinos Alive! event had life-size dinosaur models throughout the park.',
      featureFirst:true
    },
    {
      id:'fallen-kingdom',
      folder:'images/jurassic world fallen kingdom',
      title:'Jurassic World: Fallen Kingdom',
      date:'July 10, 2018',
      place:'',
      description:'Photos from a Jurassic World: Fallen Kingdom outing in July 2018.'
    }
  ];

  const galleryStyles = document.createElement('style');
  galleryStyles.textContent = `
    .gallery-intro{margin:0;line-height:1.55}
    .album-index{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .album-card{border:2px solid #6f5a3c;background:#17120e;cursor:pointer;overflow:hidden;transition:transform .15s ease,border-color .15s ease}
    .album-card:hover,.album-card:focus{transform:translateY(-2px);border-color:var(--gold);outline:none}
    .album-card-cover{width:100%;aspect-ratio:16/10;object-fit:cover;display:block;background:#0d0a08}
    .album-card-copy{padding:11px 12px 13px}
    .album-card-title{font-size:18px;font-weight:bold;color:var(--gold);margin-bottom:3px}
    .album-card-meta{font-size:12px;opacity:.78}
    .album-card-count{font-size:12px;margin-top:7px;color:#d8c69d}
    .album-section{scroll-margin-top:15px}
    .album-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:12px}
    .album-copy{max-width:850px;line-height:1.5}
    .album-date{color:var(--gold);font-weight:bold;margin-bottom:5px}
    .album-meta{color:#d8c69d;font-size:12px;white-space:nowrap}
    .real-gallery-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .gallery-photo{position:relative;margin:0;aspect-ratio:4/3;overflow:hidden;background:#0d0a08;border:2px solid #6f5a3c;cursor:zoom-in}
    .gallery-photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .18s ease,filter .18s ease}
    .gallery-photo:hover img{transform:scale(1.025);filter:brightness(1.05)}
    .gallery-photo.featured{grid-column:span 2;grid-row:span 2;aspect-ratio:auto;min-height:360px}
    .gallery-photo-label{position:absolute;left:0;right:0;bottom:0;padding:25px 9px 7px;background:linear-gradient(transparent,rgba(0,0,0,.8));font-size:11px;color:#eee1c3;opacity:0;transition:opacity .15s ease}
    .gallery-photo:hover .gallery-photo-label{opacity:1}
    .album-section.collapsed .gallery-photo:nth-child(n+9){display:none}
    .album-toggle{margin-top:12px;background:#24180f;color:#ead8af;border:1px solid #8b6f49;padding:7px 11px;font:inherit;cursor:pointer}
    .album-toggle:hover{border-color:var(--gold);color:#fff1c9}
    .home-trip-feature{display:grid;grid-template-columns:minmax(220px,1.15fr) 1fr;gap:16px;align-items:center}
    .home-trip-photo{width:100%;aspect-ratio:4/3;object-fit:cover;border:2px solid #7b6848;display:block;cursor:pointer}
    .home-trip-title{color:var(--gold);font-size:21px;font-weight:bold}
    .gallery-loading{padding:24px;text-align:center;opacity:.7}
    .gallery-error{padding:18px;border:1px solid #7c523e;background:#22110e;color:#efcfbe}
    .photo-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.93);z-index:9999;display:none;align-items:center;justify-content:center;padding:28px}
    .photo-lightbox.open{display:flex}
    .photo-lightbox-inner{position:relative;max-width:min(1200px,94vw);max-height:92vh;display:flex;flex-direction:column;align-items:center}
    .photo-lightbox-img{max-width:100%;max-height:82vh;object-fit:contain;box-shadow:0 8px 40px #000}
    .photo-lightbox-caption{margin-top:9px;color:#e8dcc5;font-size:13px;text-align:center}
    .lightbox-close,.lightbox-prev,.lightbox-next{position:absolute;background:rgba(20,15,11,.78);color:#fff;border:1px solid #9a8464;cursor:pointer;font-size:24px;line-height:1;padding:9px 12px}
    .lightbox-close{right:0;top:-46px}
    .lightbox-prev{left:-58px;top:45%}
    .lightbox-next{right:-58px;top:45%}
    @media(max-width:1000px){.album-index{grid-template-columns:repeat(2,minmax(0,1fr))}.real-gallery-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.gallery-photo.featured{min-height:300px}.home-trip-feature{grid-template-columns:1fr 1fr}}
    @media(max-width:720px){.album-index{grid-template-columns:1fr}.real-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.gallery-photo.featured{grid-column:span 2;grid-row:span 1;min-height:230px}.home-trip-feature{grid-template-columns:1fr}.album-head{display:block}.album-meta{margin-top:8px}.lightbox-prev{left:4px}.lightbox-next{right:4px}.photo-lightbox{padding:14px}}
  `;
  document.head.appendChild(galleryStyles);

  const lightbox = document.createElement('div');
  lightbox.className = 'photo-lightbox';
  lightbox.setAttribute('aria-hidden','true');
  lightbox.innerHTML = `
    <div class="photo-lightbox-inner">
      <button class="lightbox-close" aria-label="Close photo">×</button>
      <button class="lightbox-prev" aria-label="Previous photo">‹</button>
      <img class="photo-lightbox-img" alt="" />
      <button class="lightbox-next" aria-label="Next photo">›</button>
      <div class="photo-lightbox-caption"></div>
    </div>`;
  document.body.appendChild(lightbox);

  let lightboxItems = [];
  let lightboxIndex = 0;
  const lightboxImg = lightbox.querySelector('.photo-lightbox-img');
  const lightboxCaption = lightbox.querySelector('.photo-lightbox-caption');

  function showLightbox(index){
    if(!lightboxItems.length) return;
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showLightbox(lightboxIndex - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showLightbox(lightboxIndex + 1));
  lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
    if(e.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
  });

  const treeApi = 'https://api.github.com/repos/cybermatt99/matthews-paleo-hq/git/trees/main?recursive=1';
  const rawBase = 'https://raw.githubusercontent.com/cybermatt99/matthews-paleo-hq/main/';
  const imageRe = /\.(jpe?g|png|webp|gif)$/i;

  function rawUrl(path){
    return rawBase + path.split('/').map(encodeURIComponent).join('/');
  }

  function albumFiles(tree, folder){
    const prefix = folder + '/';
    return tree
      .filter(item => item.type === 'blob' && item.path.startsWith(prefix) && imageRe.test(item.path))
      .map(item => ({path:item.path, src:rawUrl(item.path)}))
      .sort((a,b) => a.path.localeCompare(b.path, undefined, {numeric:true}));
  }

  function buildPhotoFigure(album, file, index, total){
    const figure = document.createElement('figure');
    figure.className = 'gallery-photo' + (album.featureFirst && index === 0 ? ' featured' : '');
    const img = document.createElement('img');
    img.src = file.src;
    img.alt = album.title + ' photo ' + (index + 1);
    img.loading = index < 2 ? 'eager' : 'lazy';
    img.decoding = 'async';
    const label = document.createElement('figcaption');
    label.className = 'gallery-photo-label';
    label.textContent = album.title + ' · ' + (index + 1) + ' of ' + total;
    figure.append(img,label);
    figure.addEventListener('click', () => {
      lightboxItems = album._files.map((f,i) => ({src:f.src, alt:album.title + ' photo ' + (i+1), caption:album.title + ' · ' + (i+1) + ' of ' + album._files.length}));
      showLightbox(index);
    });
    return figure;
  }

  function renderHomeFeature(album){
    const homePanels = [...document.querySelectorAll('#page-home article.panel')];
    const photoPanel = homePanels.find(p => p.querySelector('h2')?.textContent.includes('Photos and Trips'));
    if(!photoPanel || !album._files.length) return;
    const body = photoPanel.querySelector('.panel-body');
    body.innerHTML = `
      <div class="home-trip-feature">
        <img class="home-trip-photo" alt="Kualoa Ranch, Oahu" />
        <div>
          <div class="home-trip-title">Kualoa Ranch, Oahu</div>
          <div class="small">December 15, 2022 · Oahu, Hawaii</div>
          <p class="small">A visit to Kualoa Ranch during our Hawaii wedding and honeymoon trip, including Jurassic filming locations and a very rainy day in the valley.</p>
          <div class="linkish" data-goto="gallery">View the photo albums »</div>
        </div>
      </div>`;
    const img = body.querySelector('.home-trip-photo');
    img.src = album._files[0].src;
    img.addEventListener('click', () => {
      lightboxItems = album._files.map((f,i) => ({src:f.src, alt:album.title + ' photo ' + (i+1), caption:album.title + ' · ' + (i+1) + ' of ' + album._files.length}));
      showLightbox(0);
    });
    bindInternalLinks(body);
  }

  function renderGallery(tree){
    albums.forEach(album => album._files = albumFiles(tree, album.folder));
    const galleryGrid = document.querySelector('#page-gallery .grid');
    if(!galleryGrid) return;

    galleryGrid.innerHTML = '';

    const intro = document.createElement('article');
    intro.className = 'panel span-12';
    intro.innerHTML = '<h2>Photo Gallery</h2><div class="panel-body"><p class="gallery-intro">Trips, exhibits, museums, filming locations, and other dinosaur-related stops. Albums are kept chronological, with Kualoa Ranch featured first.</p></div>';
    galleryGrid.appendChild(intro);

    const indexPanel = document.createElement('article');
    indexPanel.className = 'panel span-12';
    indexPanel.innerHTML = '<h2>Albums</h2><div class="panel-body"><div class="album-index"></div></div>';
    const albumIndex = indexPanel.querySelector('.album-index');
    galleryGrid.appendChild(indexPanel);

    albums.forEach(album => {
      if(!album._files.length) return;
      const card = document.createElement('div');
      card.className = 'album-card';
      card.tabIndex = 0;
      card.innerHTML = `
        <img class="album-card-cover" src="${album._files[0].src}" alt="${album.title}" loading="lazy" />
        <div class="album-card-copy">
          <div class="album-card-title">${album.title}</div>
          <div class="album-card-meta">${album.date}${album.place ? ' · ' + album.place : ''}</div>
          <div class="album-card-count">${album._files.length} photo${album._files.length === 1 ? '' : 's'}</div>
        </div>`;
      const jump = () => document.getElementById('album-' + album.id)?.scrollIntoView({behavior:'smooth',block:'start'});
      card.addEventListener('click', jump);
      card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); jump(); } });
      albumIndex.appendChild(card);
    });

    albums.forEach(album => {
      if(!album._files.length) return;
      const section = document.createElement('article');
      section.className = 'panel span-12 album-section' + (album._files.length > 8 ? ' collapsed' : '');
      section.id = 'album-' + album.id;
      section.innerHTML = `
        <h2>${album.title}</h2>
        <div class="panel-body">
          <div class="album-head">
            <div class="album-copy">
              <div class="album-date">${album.date}${album.place ? ' · ' + album.place : ''}</div>
              <div class="small">${album.description}</div>
            </div>
            <div class="album-meta">${album._files.length} photo${album._files.length === 1 ? '' : 's'}</div>
          </div>
          <div class="real-gallery-grid"></div>
        </div>`;
      const grid = section.querySelector('.real-gallery-grid');
      album._files.forEach((file,index) => grid.appendChild(buildPhotoFigure(album,file,index,album._files.length)));
      if(album._files.length > 8){
        const toggle = document.createElement('button');
        toggle.className = 'album-toggle';
        toggle.textContent = 'Show all ' + album._files.length + ' photos';
        toggle.addEventListener('click', () => {
          const collapsed = section.classList.toggle('collapsed');
          toggle.textContent = collapsed ? 'Show all ' + album._files.length + ' photos' : 'Show fewer photos';
        });
        section.querySelector('.panel-body').appendChild(toggle);
      }
      galleryGrid.appendChild(section);
    });

    const kualoa = albums.find(a => a.id === 'kualoa');
    if(kualoa) renderHomeFeature(kualoa);
  }

  const galleryGrid = document.querySelector('#page-gallery .grid');
  if(galleryGrid) galleryGrid.innerHTML = '<article class="panel span-12"><h2>Photo Gallery</h2><div class="panel-body"><div class="gallery-loading">Loading photo albums…</div></div></article>';

  fetch(treeApi, {headers:{'Accept':'application/vnd.github+json'}})
    .then(r => {
      if(!r.ok) throw new Error('GitHub gallery index unavailable');
      return r.json();
    })
    .then(data => renderGallery(Array.isArray(data.tree) ? data.tree : []))
    .catch(err => {
      console.warn('Jurassic Matt gallery:', err);
      if(galleryGrid) galleryGrid.innerHTML = '<article class="panel span-12"><h2>Photo Gallery</h2><div class="panel-body"><div class="gallery-error">The photo index could not be loaded right now. The images are stored in the site repository and should return after a refresh.</div></div></article>';
    });
})();