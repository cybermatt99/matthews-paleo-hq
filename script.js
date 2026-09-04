(function(){
  const pages = [...document.querySelectorAll('.page')];
  const navButtons = [...document.querySelectorAll('.nav-btn')];
  const oldHashMap = {studies:'study',credentials:'archive',field:'archive',fossils:'collection',dinosauria:'dinodex',reading:'study',gallery:'photos',resources:'archive'};

  let sfxEnabled = localStorage.getItem('jmSfx') !== 'off';
  let audioCtx = null;
  const soundToggle = document.getElementById('soundToggle');

  function tone(freq=520,duration=.045,volume=.018){
    if(!sfxEnabled) return;
    try{
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume,audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime + duration);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + duration);
    }catch(e){}
  }

  function updateSoundLabel(){
    if(!soundToggle) return;
    soundToggle.textContent = 'SFX: ' + (sfxEnabled ? 'ON' : 'OFF');
    soundToggle.setAttribute('aria-pressed',String(sfxEnabled));
  }
  updateSoundLabel();
  soundToggle?.addEventListener('click',()=>{sfxEnabled=!sfxEnabled;localStorage.setItem('jmSfx',sfxEnabled?'on':'off');updateSoundLabel();if(sfxEnabled) tone(660,.06,.02)});

  function go(page,smooth=true){
    const mapped = oldHashMap[page] || page;
    const target = document.getElementById('page-' + mapped);
    if(!target) return;
    pages.forEach(p=>p.classList.toggle('active',p===target));
    navButtons.forEach(b=>b.classList.toggle('active',b.dataset.page===mapped));
    if(history.replaceState) history.replaceState(null,'','#'+mapped); else location.hash = mapped;
    document.title = mapped === 'home' ? 'Jurassic Matt | Field Terminal' : 'Jurassic Matt | ' + (navButtons.find(b=>b.dataset.page===mapped)?.textContent.trim() || mapped);
    if(smooth) window.scrollTo({top:0,behavior:'smooth'}); else window.scrollTo(0,0);
    tone(mapped==='dinodex'?620:480,.04,.014);
  }

  navButtons.forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
  document.addEventListener('click',e=>{
    const el = e.target.closest('[data-goto]');
    if(el){ e.preventDefault(); go(el.dataset.goto); }
  });
  const incoming = location.hash.replace('#','');
  if(incoming && document.getElementById('page-'+(oldHashMap[incoming]||incoming))) go(incoming,false);

  function updateClock(){
    const el=document.getElementById('systemClock'); if(!el) return;
    const d=new Date();
    const p=n=>String(n).padStart(2,'0');
    el.textContent=`${p(d.getMonth()+1)}/${p(d.getDate())}/${d.getFullYear()}  ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
  updateClock(); setInterval(updateClock,1000);

  const species = [
    {name:'Spinosaurus aegyptiacus',abbr:'SP',category:'dinosaur',favorite:true,group:'Spinosaurid theropod',period:'Late Cretaceous',region:'North Africa',diet:'Carnivore / fish-eater',summary:'A giant sail-backed theropod with unusually strong evidence for close ecological ties to aquatic habitats.'},
    {name:'Tyrannosaurus rex',abbr:'TR',category:'dinosaur',favorite:true,group:'Tyrannosaurid theropod',period:'Late Cretaceous',region:'North America',diet:'Carnivore',summary:'A massive late-surviving tyrannosaur with exceptional bite force, robust teeth, and some of the best-studied theropod anatomy.'},
    {name:'Velociraptor',abbr:'VR',category:'dinosaur',favorite:true,group:'Dromaeosaurid theropod',period:'Late Cretaceous',region:'Mongolia',diet:'Carnivore',summary:'A small feathered dromaeosaur known from excellent Mongolian fossils, including the famous fighting dinosaurs specimen.'},
    {name:'Brachiosaurus',abbr:'BR',category:'dinosaur',favorite:true,group:'Sauropod dinosaur',period:'Late Jurassic',region:'North America',diet:'Herbivore',summary:'A tall-fronted sauropod with elongated forelimbs and a high browsing body plan.'},
    {name:'Triceratops',abbr:'TC',category:'dinosaur',favorite:true,group:'Ceratopsid dinosaur',period:'Late Cretaceous',region:'North America',diet:'Herbivore',summary:'A large horned dinosaur with two long brow horns, a nasal horn, and a broad bony frill.'},
    {name:'Stegosaurus',abbr:'ST',category:'dinosaur',group:'Stegosaurian dinosaur',period:'Late Jurassic',region:'North America',diet:'Herbivore',summary:'A plated herbivore with paired dorsal plates and a tail armed with large spikes.'},
    {name:'Dilophosaurus',abbr:'DI',category:'dinosaur',group:'Theropod dinosaur',period:'Early Jurassic',region:'North America',diet:'Carnivore',summary:'An early large-bodied theropod recognized by paired cranial crests.'},
    {name:'Pterodactyl',abbr:'PT',category:'other',group:'Pterosaur',period:'Mesozoic',region:'Various',diet:'Varied',summary:'A familiar informal label for pterodactyloid pterosaurs. This entry is a starting point for more precise pterosaur study.'},
    {name:'Deinonychus',abbr:'DE',category:'dinosaur',group:'Dromaeosaurid theropod',period:'Early Cretaceous',region:'North America',diet:'Carnivore',summary:'The dromaeosaur whose anatomy helped transform the modern view of dinosaurs as active, dynamic animals.'},
    {name:'Giganotosaurus',abbr:'GI',category:'dinosaur',group:'Carcharodontosaurid theropod',period:'Late Cretaceous',region:'South America',diet:'Carnivore',summary:'A gigantic South American carcharodontosaurid and one of the largest known terrestrial predators.'},
    {name:'Megalodon',abbr:'ME',category:'marine',group:'Megatooth shark',period:'Miocene to Pliocene',region:'Worldwide seas',diet:'Carnivore',summary:'An enormous extinct shark known especially from its huge, abundant fossil teeth.'},
    {name:'Mosasaurus',abbr:'MO',category:'marine',group:'Mosasaurid marine reptile',period:'Late Cretaceous',region:'Global seas',diet:'Carnivore',summary:'A giant marine squamate and apex predator of Late Cretaceous oceans.'},
    {name:'Liopleurodon',abbr:'LI',category:'marine',group:'Pliosaurid marine reptile',period:'Middle Jurassic',region:'Europe',diet:'Carnivore',summary:'A large short-necked pliosaur with a powerful skull and marine predatory lifestyle.'},
    {name:'Titanoboa',abbr:'TB',category:'other',group:'Giant snake',period:'Paleocene',region:'South America',diet:'Carnivore',summary:'An enormous post-dinosaur snake from tropical Paleocene ecosystems.'},
    {name:'Carnotaurus',abbr:'CA',category:'dinosaur',group:'Abelisaurid theropod',period:'Late Cretaceous',region:'South America',diet:'Carnivore',summary:'A distinctive horned abelisaurid with tiny forelimbs and a deep, short skull.'},
    {name:'Ceratosaurus',abbr:'CE',category:'dinosaur',group:'Ceratosaurian theropod',period:'Late Jurassic',region:'North America / Europe',diet:'Carnivore',summary:'A Jurassic predator known for a prominent nasal horn and blade-like teeth.'},
    {name:'Dimetrodon',abbr:'DM',category:'other',group:'Non-mammalian synapsid',period:'Early Permian',region:'North America / Europe',diet:'Carnivore',summary:'A sail-backed synapsid that lived long before dinosaurs and is closer to mammals than to reptiles.'},
    {name:'Allosaurus',abbr:'AL',category:'dinosaur',group:'Allosauroid theropod',period:'Late Jurassic',region:'North America / Europe',diet:'Carnivore',summary:'One of the dominant large predators of Late Jurassic ecosystems.'},
    {name:'Brontosaurus',abbr:'BN',category:'dinosaur',group:'Diplodocid sauropod',period:'Late Jurassic',region:'North America',diet:'Herbivore',summary:'A massive diplodocid sauropod with a long neck and whip-like tail.'},
    {name:'Argentinosaurus',abbr:'AR',category:'dinosaur',group:'Titanosaur sauropod',period:'Late Cretaceous',region:'South America',diet:'Herbivore',summary:'A gigantic titanosaur represented by incomplete remains but widely regarded among the largest known land animals.'},
    {name:'Utahraptor',abbr:'UT',category:'dinosaur',group:'Dromaeosaurid theropod',period:'Early Cretaceous',region:'North America',diet:'Carnivore',summary:'A very large dromaeosaur with powerful limbs and enlarged sickle claws.'},
    {name:'Oviraptor',abbr:'OV',category:'dinosaur',group:'Oviraptorosaur theropod',period:'Late Cretaceous',region:'Mongolia',diet:'Omnivore',summary:'A beaked theropod whose reputation as an egg thief was overturned by nesting evidence.'},
    {name:'Compsognathus',abbr:'CO',category:'dinosaur',group:'Small theropod',period:'Late Jurassic',region:'Europe',diet:'Carnivore',summary:'A small lightly built theropod historically famous for its diminutive size.'},
    {name:'Troodon',abbr:'TO',category:'dinosaur',group:'Troodontid archive label',period:'Late Cretaceous',region:'North America',diet:'Carnivore / omnivore',summary:'A historically important but taxonomically complicated name. This dossier is a good place to track the ongoing classification story.'},
    {name:'Gallimimus',abbr:'GA',category:'dinosaur',group:'Ornithomimid theropod',period:'Late Cretaceous',region:'Mongolia',diet:'Omnivore',summary:'A large ostrich-like ornithomimid built for fast terrestrial locomotion.'},
    {name:'Iguanodon',abbr:'IG',category:'dinosaur',group:'Ornithopod dinosaur',period:'Early Cretaceous',region:'Europe',diet:'Herbivore',summary:'A historically important ornithopod famous for its thumb spike and changing reconstructions through the history of paleontology.'}
  ];

  const featuredGrid=document.getElementById('featuredSpeciesGrid');
  const listGrid=document.getElementById('speciesListGrid');
  const searchInput=document.getElementById('speciesSearch');
  const filters=[...document.querySelectorAll('.filter')];
  let currentFilter='all';

  function speciesMatches(s,q){
    const text=(s.name+' '+s.group+' '+s.period+' '+s.region+' '+s.diet).toLowerCase();
    if(q && !text.includes(q)) return false;
    if(currentFilter==='favorite' && !s.favorite) return false;
    if(currentFilter==='dinosaur' && s.category!=='dinosaur') return false;
    if(currentFilter==='marine' && s.category!=='marine') return false;
    if(currentFilter==='other' && s.category!=='other') return false;
    return true;
  }

  function renderSpecies(){
    if(!featuredGrid||!listGrid) return;
    const q=(searchInput?.value||'').trim().toLowerCase();
    const matches=species.filter(s=>speciesMatches(s,q));
    let featureSet = currentFilter==='all' && !q ? species.filter(s=>s.favorite) : matches.slice(0,5);
    featuredGrid.innerHTML=featureSet.map(s=>`<article class="species-card"><div class="species-name">${s.name}</div><div class="species-visual"><span>${s.abbr}</span></div><div class="species-facts">GROUP: ${s.group}<br>PERIOD: ${s.period}<br>REGION: ${s.region}<br>DIET: ${s.diet}</div><button data-species="${s.name}">VIEW DOSSIER ▶</button></article>`).join('');
    const featureNames=new Set(featureSet.map(s=>s.name));
    const remainder=matches.filter(s=>!featureNames.has(s.name));
    listGrid.innerHTML=remainder.map(s=>`<button class="species-list-item" data-species="${s.name}">${s.name}<span>▶</span></button>`).join('') || '<div class="species-list-item">NO MATCHING RECORDS</div>';
  }
  renderSpecies();
  searchInput?.addEventListener('input',renderSpecies);
  filters.forEach(f=>f.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));f.classList.add('active');currentFilter=f.dataset.filter;renderSpecies();tone(700,.035,.012)}));

  const modal=document.getElementById('speciesModal');
  const modalContent=document.getElementById('speciesModalContent');
  const modalClose=document.getElementById('speciesModalClose');
  function noteKey(name){return 'jmSpeciesNote::'+name}
  function updateNoteCount(){const el=document.getElementById('savedNotesCount');if(!el)return;const n=species.filter(s=>(localStorage.getItem(noteKey(s.name))||'').trim()).length;el.textContent=String(n).padStart(2,'0')}
  function openSpecies(name){
    const s=species.find(x=>x.name===name); if(!s||!modalContent) return;
    const saved=localStorage.getItem(noteKey(s.name))||'';
    modalContent.innerHTML=`<div class="dossier-body"><div class="dossier-icon">${s.abbr}</div><div class="dossier-data"><h2>${s.name}</h2><div class="terminal-meta">${s.group.toUpperCase()} // ${s.period.toUpperCase()}</div><p><b>Region:</b> ${s.region}<br><b>Diet:</b> ${s.diet}</p><p>${s.summary}</p></div><div class="dossier-notes"><label>PERSONAL RESEARCH NOTES // SAVED TO THIS BROWSER</label><textarea id="dossierTextarea" placeholder="Add questions, observations, sources to revisit, reconstruction notes, or anything else you want to remember...">${saved.replace(/</g,'&lt;')}</textarea><button class="terminal-button save-note" id="saveDossierNote">SAVE NOTES <span>▶</span></button></div></div>`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; tone(780,.05,.014);
    document.getElementById('saveDossierNote')?.addEventListener('click',()=>{localStorage.setItem(noteKey(s.name),document.getElementById('dossierTextarea').value);updateNoteCount();tone(900,.06,.018)});
  }
  function closeSpecies(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  document.addEventListener('click',e=>{const el=e.target.closest('[data-species]');if(el){e.preventDefault();openSpecies(el.dataset.species)}});
  modalClose?.addEventListener('click',closeSpecies); modal?.addEventListener('click',e=>{if(e.target===modal)closeSpecies()});
  updateNoteCount();

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

  function albumFiles(tree,folder){const prefix=folder+'/';return tree.filter(i=>i.type==='blob'&&i.path.startsWith(prefix)&&imageRe.test(i.path)).map(i=>({path:i.path,src:rawUrl(i.path),name:i.path.slice(prefix.length)})).sort((a,b)=>a.path.localeCompare(b.path,undefined,{numeric:true}))}
  let lightboxItems=[],lightboxIndex=0;
  const lightbox=document.getElementById('photoLightbox'), lightboxImage=document.getElementById('lightboxImage'), lightboxCaption=document.getElementById('lightboxCaption');
  function showLightbox(index){if(!lightboxItems.length)return;lightboxIndex=(index+lightboxItems.length)%lightboxItems.length;const item=lightboxItems[lightboxIndex];lightboxImage.src=item.src;lightboxImage.alt=item.alt;lightboxCaption.textContent=item.caption;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeLightbox(){lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  document.getElementById('lightboxClose')?.addEventListener('click',closeLightbox);document.getElementById('lightboxPrev')?.addEventListener('click',()=>showLightbox(lightboxIndex-1));document.getElementById('lightboxNext')?.addEventListener('click',()=>showLightbox(lightboxIndex+1));lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});

  function renderGallery(tree){
    if(!galleryRoot)return;
    albums.forEach(a=>a.files=albumFiles(tree,a.folder));
    galleryRoot.innerHTML='';
    const indexModule=document.createElement('article');indexModule.className='module';indexModule.innerHTML='<div class="module-title"><span class="led green"></span>PHOTO ARCHIVE INDEX</div><div class="album-index"></div>';
    const index=indexModule.querySelector('.album-index');
    albums.filter(a=>a.files.length).forEach(a=>{const cover=a.files.find(f=>f.name===a.cover)||a.files[0];const card=document.createElement('button');card.className='album-card';card.innerHTML=`<img src="${cover.src}" alt="${a.title}"><div class="album-card-copy"><div class="album-card-title">${a.title}</div><div class="album-card-meta">${a.date}${a.place?' • '+a.place:''}</div><div class="album-card-count">${a.files.length} PHOTOS</div></div>`;card.addEventListener('click',()=>document.getElementById('album-'+a.id)?.scrollIntoView({behavior:'smooth'}));index.appendChild(card)});
    galleryRoot.appendChild(indexModule);
    albums.filter(a=>a.files.length).forEach(a=>{const section=document.createElement('article');section.className='module album-section'+(a.files.length>8?' collapsed':'');section.id='album-'+a.id;section.innerHTML=`<div class="module-title"><span class="led ${a.featured?'green':'amber'}"></span>${a.title}</div><div class="album-head"><div><div class="album-date">${a.date}${a.place?' • '+a.place:''}</div><div class="album-copy">${a.description}</div></div><div class="album-meta">${a.files.length} PHOTOS</div></div><div class="real-gallery-grid"></div>`;const grid=section.querySelector('.real-gallery-grid');a.files.forEach((f,i)=>{const fig=document.createElement('figure');fig.className='gallery-photo'+(a.featured&&i===0?' featured':'');fig.innerHTML=`<img loading="lazy" src="${f.src}" alt="${a.title} photo ${i+1}"><figcaption class="gallery-photo-label">${a.title} • ${i+1} of ${a.files.length}</figcaption>`;fig.addEventListener('click',()=>{lightboxItems=a.files.map((x,j)=>({src:x.src,alt:a.title+' photo '+(j+1),caption:a.title+' • '+(j+1)+' of '+a.files.length}));showLightbox(i)});grid.appendChild(fig)});if(a.files.length>8){const btn=document.createElement('button');btn.className='album-toggle';btn.textContent='SHOW ALL '+a.files.length+' PHOTOS';btn.addEventListener('click',()=>{const c=section.classList.toggle('collapsed');btn.textContent=c?'SHOW ALL '+a.files.length+' PHOTOS':'SHOW FEWER PHOTOS'});section.appendChild(btn)}galleryRoot.appendChild(section)});
  }
  fetch(treeApi,{headers:{Accept:'application/vnd.github+json'}}).then(r=>{if(!r.ok)throw new Error('Photo index unavailable');return r.json()}).then(d=>renderGallery(Array.isArray(d.tree)?d.tree:[])).catch(()=>{if(galleryRoot)galleryRoot.innerHTML='<div class="module"><div class="module-title"><span class="led red"></span>PHOTO ARCHIVE</div><div class="gallery-loading">PHOTO INDEX TEMPORARILY UNAVAILABLE. REFRESH TO RETRY.</div></div>'});

  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(modal?.classList.contains('open'))closeSpecies();if(lightbox?.classList.contains('open'))closeLightbox()}if(lightbox?.classList.contains('open')&&e.key==='ArrowLeft')showLightbox(lightboxIndex-1);if(lightbox?.classList.contains('open')&&e.key==='ArrowRight')showLightbox(lightboxIndex+1)});
})();
