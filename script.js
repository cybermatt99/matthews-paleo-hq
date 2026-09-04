(function(){
  const pages=[...document.querySelectorAll('.page')];
  const navButtons=[...document.querySelectorAll('.nav-btn')];
  const oldHashMap={studies:'study',credentials:'archive',field:'archive',fossils:'collection',dinosauria:'dinodex',reading:'study',gallery:'photos',resources:'archive'};
  let sfxEnabled=localStorage.getItem('jmSfx')!=='off';
  let audioCtx=null;
  const soundToggle=document.getElementById('soundToggle');

  function tone(freq=520,duration=.045,volume=.018){
    if(!sfxEnabled)return;
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
      osc.type='square';osc.frequency.value=freq;
      gain.gain.setValueAtTime(volume,audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);
      osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);
    }catch(e){}
  }
  function updateSoundLabel(){if(!soundToggle)return;soundToggle.textContent='SFX: '+(sfxEnabled?'ON':'OFF');soundToggle.setAttribute('aria-pressed',String(sfxEnabled));}
  updateSoundLabel();
  soundToggle?.addEventListener('click',()=>{sfxEnabled=!sfxEnabled;localStorage.setItem('jmSfx',sfxEnabled?'on':'off');updateSoundLabel();if(sfxEnabled)tone(660,.06,.02)});

  function go(page,smooth=true){
    const mapped=oldHashMap[page]||page,target=document.getElementById('page-'+mapped);if(!target)return;
    pages.forEach(p=>p.classList.toggle('active',p===target));navButtons.forEach(b=>b.classList.toggle('active',b.dataset.page===mapped));
    if(history.replaceState)history.replaceState(null,'','#'+mapped);else location.hash=mapped;
    document.title=mapped==='home'?'Jurassic Matt | Field Terminal':'Jurassic Matt | '+(navButtons.find(b=>b.dataset.page===mapped)?.textContent.trim()||mapped);
    window.scrollTo({top:0,behavior:smooth?'smooth':'auto'});tone(mapped==='dinodex'?620:480,.04,.014);
  }
  navButtons.forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
  document.addEventListener('click',e=>{
    const jump=e.target.closest('[data-goto]');if(jump){e.preventDefault();go(jump.dataset.goto);return;}
    const species=e.target.closest('[data-species]');if(species){e.preventDefault();go('dinodex');const wanted=species.dataset.species;let tries=0;const seek=setInterval(()=>{const box=document.getElementById('dexSearch2');if(box){clearInterval(seek);box.value=wanted;box.dispatchEvent(new Event('input',{bubbles:true}));box.focus();}else if(++tries>25)clearInterval(seek);},80);}
  });
  const incoming=location.hash.replace('#','');if(incoming&&document.getElementById('page-'+(oldHashMap[incoming]||incoming)))go(incoming,false);

  function updateClock(){const el=document.getElementById('systemClock');if(!el)return;const d=new Date(),p=n=>String(n).padStart(2,'0');el.textContent=`${p(d.getMonth()+1)}/${p(d.getDate())}/${d.getFullYear()}  ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;}
  updateClock();setInterval(updateClock,1000);

  const modal=document.getElementById('speciesModal');
  function closeSpecies(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  document.getElementById('speciesModalClose')?.addEventListener('click',closeSpecies);
  modal?.addEventListener('click',e=>{if(e.target===modal)closeSpecies();});

  const albums=[
    {id:'kualoa',folder:'images/kualoa ranch 12-15-2022',title:'Kualoa Ranch, Oahu',date:'December 15, 2022',place:'Oahu, Hawaii',description:'Arielle and I visited Kualoa Ranch during our Hawaii wedding and honeymoon trip. We toured Jurassic filming locations, saw dinosaur-themed stops and set pieces, and got a very rainy day in the valley.',cover:'491420852_9718244551586388_1127477591582424271_n (1).jpg',featured:true},
    {id:'dinos-unearthed',folder:'images/dinos unearthed 2-27-2025',title:'Dinos Unearthed',date:'February 27, 2025',place:'',description:'Photos from a visit to Dinos Unearthed in February 2025.'},
    {id:'jurassic-quest',folder:'images/jurassic quest 7-21-2024',title:'Jurassic Quest',date:'July 21, 2024',place:'',description:'Photos from Jurassic Quest in July 2024.'},
    {id:'prehistoric-predators',folder:'images/prehistoric predators zoo tampa',title:'ZooTampa: Prehistoric Predators',date:'2024',place:'Tampa, Florida',description:'Photos from our visit during ZooTampa’s 2024 Prehistoric Predators run.'},
    {id:'dinosaur-world',folder:'images/dinosaur world plant city fl 04-27-2021',title:'Dinosaur World',date:'April 27, 2021',place:'Plant City, Florida',description:'A visit to Dinosaur World in Plant City, Florida.'},
    {id:'dinos-alive',folder:'images/dinos alive 8-10-2020',title:'ZooTampa: Dinos Alive!',date:'August 10, 2020',place:'Tampa, Florida',description:'A very 2020 dinosaur outing, masks included, with life-size dinosaur displays throughout the event.'},
    {id:'fallen-kingdom',folder:'images/jurassic world fallen kingdom',title:'Jurassic World: Fallen Kingdom',date:'July 10, 2018',place:'',description:'Photos from a Jurassic World: Fallen Kingdom outing in July 2018.'}
  ];
  const treeApi='https://api.github.com/repos/cybermatt99/matthews-paleo-hq/git/trees/main?recursive=1';
  const rawBase='https://raw.githubusercontent.com/cybermatt99/matthews-paleo-hq/main/';
  const imageRe=/\.(jpe?g|png|webp|gif)$/i;
  const rawUrl=path=>rawBase+path.split('/').map(encodeURIComponent).join('/');
  const galleryRoot=document.getElementById('galleryRoot');
  function albumFiles(tree,folder){const prefix=folder+'/';return tree.filter(i=>i.type==='blob'&&i.path.startsWith(prefix)&&imageRe.test(i.path)).map(i=>({path:i.path,src:rawUrl(i.path),name:i.path.slice(prefix.length)})).sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true}));}

  let lightboxItems=[],lightboxIndex=0;
  const lightbox=document.getElementById('photoLightbox'),lightboxImage=document.getElementById('lightboxImage'),lightboxCaption=document.getElementById('lightboxCaption');
  function showLightbox(index){if(!lightboxItems.length)return;lightboxIndex=(index+lightboxItems.length)%lightboxItems.length;const item=lightboxItems[lightboxIndex];lightboxImage.src=item.src;lightboxImage.alt=item.alt;lightboxCaption.textContent=item.caption;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
  function closeLightbox(){lightbox?.classList.remove('open');lightbox?.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  document.getElementById('lightboxClose')?.addEventListener('click',closeLightbox);document.getElementById('lightboxPrev')?.addEventListener('click',()=>showLightbox(lightboxIndex-1));document.getElementById('lightboxNext')?.addEventListener('click',()=>showLightbox(lightboxIndex+1));lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox();});

  function renderGallery(tree){
    if(!galleryRoot)return;albums.forEach(a=>a.files=albumFiles(tree,a.folder));galleryRoot.innerHTML='';
    const indexModule=document.createElement('article');indexModule.className='module';indexModule.innerHTML='<div class="module-title"><span class="led green"></span>PHOTO ARCHIVE INDEX</div><div class="album-index"></div>';const index=indexModule.querySelector('.album-index');
    albums.filter(a=>a.files.length).forEach(a=>{const cover=a.files.find(f=>f.name===a.cover)||a.files[0],card=document.createElement('button');card.className='album-card';card.innerHTML=`<img src="${cover.src}" alt="${a.title}"><div class="album-card-copy"><div class="album-card-title">${a.title}</div><div class="album-card-meta">${a.date}${a.place?' • '+a.place:''}</div><div class="album-card-count">${a.files.length} PHOTOS</div></div>`;card.addEventListener('click',()=>document.getElementById('album-'+a.id)?.scrollIntoView({behavior:'smooth'}));index.appendChild(card);});galleryRoot.appendChild(indexModule);
    albums.filter(a=>a.files.length).forEach(a=>{const section=document.createElement('article');section.className='module album-section'+(a.files.length>8?' collapsed':'');section.id='album-'+a.id;section.innerHTML=`<div class="module-title"><span class="led ${a.featured?'green':'amber'}"></span>${a.title}</div><div class="album-head"><div><div class="album-date">${a.date}${a.place?' • '+a.place:''}</div><div class="album-copy">${a.description}</div></div><div class="album-meta">${a.files.length} PHOTOS</div></div><div class="real-gallery-grid"></div>`;const grid=section.querySelector('.real-gallery-grid');a.files.forEach((f,i)=>{const fig=document.createElement('figure');fig.className='gallery-photo'+(a.featured&&i===0?' featured':'');fig.innerHTML=`<img loading="lazy" src="${f.src}" alt="${a.title} photo ${i+1}"><figcaption class="gallery-photo-label">${a.title} • ${i+1} of ${a.files.length}</figcaption>`;fig.addEventListener('click',()=>{lightboxItems=a.files.map((x,j)=>({src:x.src,alt:a.title+' photo '+(j+1),caption:a.title+' • '+(j+1)+' of '+a.files.length}));showLightbox(i);});grid.appendChild(fig);});if(a.files.length>8){const btn=document.createElement('button');btn.className='album-toggle';btn.textContent='SHOW ALL '+a.files.length+' PHOTOS';btn.addEventListener('click',()=>{const c=section.classList.toggle('collapsed');btn.textContent=c?'SHOW ALL '+a.files.length+' PHOTOS':'SHOW FEWER PHOTOS';});section.appendChild(btn);}galleryRoot.appendChild(section);});
  }
  fetch(treeApi,{headers:{Accept:'application/vnd.github+json'}}).then(r=>{if(!r.ok)throw new Error('Photo index unavailable');return r.json();}).then(d=>renderGallery(Array.isArray(d.tree)?d.tree:[])).catch(()=>{if(galleryRoot)galleryRoot.innerHTML='<div class="module"><div class="module-title"><span class="led red"></span>PHOTO ARCHIVE</div><div class="gallery-loading">PHOTO INDEX TEMPORARILY UNAVAILABLE. REFRESH TO RETRY.</div></div>';});

  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(modal?.classList.contains('open'))closeSpecies();if(lightbox?.classList.contains('open'))closeLightbox();}if(lightbox?.classList.contains('open')&&e.key==='ArrowLeft')showLightbox(lightboxIndex-1);if(lightbox?.classList.contains('open')&&e.key==='ArrowRight')showLightbox(lightboxIndex+1);});

  const loader=document.createElement('script');loader.src='dinodex-loader.js';document.body.appendChild(loader);
})();