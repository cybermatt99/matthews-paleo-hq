(function(){
  const data = Array.isArray(window.JM_DINODEX_DATA) ? window.JM_DINODEX_DATA : [];
  const page = document.getElementById('page-dinodex');
  if(!page || !data.length) return;
  const layout = page.querySelector('.dinodex-layout');
  if(!layout) return;

  const state = {filter:'all', query:'', sort:'featured', shown:24};
  const noteKey = name => 'jmSpeciesNote::' + name;
  const sourceKey = name => 'jmSpeciesSources::' + name;
  const statusKey = name => 'jmSpeciesStatus::' + name;
  const starKey = name => 'jmSpeciesStar::' + name;
  const wikiCache = new Map();
  let modalSpecies = null;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const stripHtml = v => { const d=document.createElement('div'); d.innerHTML=v||''; return (d.textContent||d.innerText||'').trim(); };
  const abbr = s => (s.name.match(/[A-Za-z]+/g)||['?']).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const isPersonalFavorite = s => s.favorite || localStorage.getItem(starKey(s.name))==='1';
  const noteExists = s => (localStorage.getItem(noteKey(s.name))||'').trim().length>0;
  const scientific = s => s.scientific || s.name;

  layout.innerHTML = `
    <aside class="module dex-sidebar dex-upgrade-sidebar">
      <div class="module-title"><span class="led green"></span>FEATURED SPECIES</div>
      <div class="favorite-list compact" id="dexFavoriteList"></div>
      <div class="module-title sub-title">QUICK FILTERS</div>
      <div class="dex-category-stack" id="dexCategoryStack"></div>
      <div class="module-title sub-title">CURATOR NOTES</div>
      <img class="curator-photo" src="https://raw.githubusercontent.com/cybermatt99/matthews-paleo-hq/main/images/kualoa%20ranch%2012-15-2022/491757965_9718244574919719_3042173133725601820_n.jpg" alt="Matthew at Kualoa Ranch" />
      <p class="curator-copy">A growing research archive for dinosaurs and other prehistoric animals. The structured facts are a starting point, not the last word. Open a dossier, follow the sources, and add your own notes.</p>
    </aside>
    <section class="module dex-main dex-upgrade-main">
      <div class="module-title"><span class="led amber"></span>SPECIES INDEX // EXPANDED ARCHIVE</div>
      <div class="dex-intro-strip">
        <div><b id="dexTotalReadout">${String(data.length).padStart(3,'0')}</b><span>SEEDED RECORDS</span></div>
        <div><b id="dexDinosaurReadout">${String(data.filter(s=>s.category==='Dinosaur').length).padStart(3,'0')}</b><span>DINOSAURS</span></div>
        <div><b id="dexNoteReadout">000</b><span>WITH YOUR NOTES</span></div>
        <div class="dex-source-status"><i></i><span>WIKIMEDIA IMAGE LINK ACTIVE</span></div>
      </div>
      <div class="dex-controls dex-controls-expanded">
        <label class="search-box dex-search"><input id="dexSearch2" type="search" placeholder="Search species, clade, period, region..." autocomplete="off"><span>⌕</span></label>
        <select id="dexSort2" class="dex-sort" aria-label="Sort Dino-Dex"><option value="featured">SORT: FEATURED</option><option value="az">SORT: A TO Z</option><option value="period">SORT: GEOLOGIC AGE</option><option value="notes">SORT: MY NOTES FIRST</option></select>
        <button class="terminal-button dex-random" id="dexRandom" type="button">RANDOM DOSSIER <span>▶</span></button>
      </div>
      <div class="dex-active-filter" id="dexActiveFilter">ALL RECORDS</div>
      <div class="dex-card-grid" id="dexCardGrid"></div>
      <div class="dex-load-row"><button class="terminal-button" id="dexLoadMore" type="button">LOAD MORE RECORDS <span>▼</span></button></div>
    </section>
    <aside class="module notes-sidebar dex-upgrade-notes">
      <div class="module-title"><span class="led green"></span>STUDY CONSOLE</div>
      <div class="notebook-panel dex-guide"><h3>How to use the Dino-Dex</h3><ol><li>Open anything that catches your eye.</li><li>Read the structured dossier first.</li><li>Use the live Wikipedia reference overview and source links.</li><li>Record questions, corrections, and paper notes in your personal notebook.</li><li>Leave uncertain fields unresolved until you can support them.</li></ol></div>
      <div class="module-title sub-title">ARCHIVE STATS</div>
      <div class="archive-stats dex-stats" id="dexStats"></div>
      <div class="module-title sub-title">RESEARCH PRINCIPLE</div>
      <div class="dex-principle">DIRECT EVIDENCE <span>›</span> STRONG INFERENCE <span>›</span> PLAUSIBLE <span>›</span> SPECULATIVE</div>
      <p class="small dex-source-note">Reference images are requested from Wikipedia/Wikimedia at display time. When available, the dossier shows the source page and license metadata.</p>
    </aside>`;

  page.querySelector('.page-banner p').textContent = `A personal research index with ${data.length} seeded prehistoric animals, live reference imagery, study prompts, and your own persistent notes.`;
  const favoriteList = document.getElementById('dexFavoriteList');
  const categoryStack = document.getElementById('dexCategoryStack');
  const grid = document.getElementById('dexCardGrid');
  const search = document.getElementById('dexSearch2');
  const sort = document.getElementById('dexSort2');
  const loadMore = document.getElementById('dexLoadMore');
  const activeFilter = document.getElementById('dexActiveFilter');
  const statBox = document.getElementById('dexStats');
  const filters = [['all','ALL RECORDS'],['favorite','FAVORITES'],['dinosaur','DINOSAURS'],['theropod','THEROPODS'],['herbivore','HERBIVORES'],['sauropod','SAUROPODS'],['marine','MARINE REPTILES'],['pterosaur','PTEROSAURS'],['other','BEYOND DINOSAURS'],['gaps','RESEARCH GAPS']];
  function hasGap(s){ return !s.age || !s.size || !s.anatomy || !s.ecology || !s.fossil || !s.uncertainty; }
  function matchFilter(s,id){
    const group=(s.group||'').toLowerCase(), diet=(s.diet||'').toLowerCase();
    if(id==='all') return true; if(id==='favorite') return isPersonalFavorite(s); if(id==='dinosaur') return s.category==='Dinosaur';
    if(id==='theropod') return s.category==='Dinosaur' && group.includes('theropod'); if(id==='herbivore') return diet.includes('herbivore');
    if(id==='sauropod') return s.category==='Dinosaur' && (group.includes('sauropod') || group.includes('sauropodomorph'));
    if(id==='marine') return s.category==='Marine Reptile'; if(id==='pterosaur') return s.category==='Pterosaur'; if(id==='other') return s.category==='Other Prehistoric'; if(id==='gaps') return hasGap(s); return true;
  }
  function countFilter(id){ return data.filter(s=>matchFilter(s,id)).length; }
  categoryStack.innerHTML = filters.map(([id,label])=>`<button class="${id==='all'?'active':''}" data-dex-filter="${id}"><span>${label}</span><b>${countFilter(id)}</b></button>`).join('');
  favoriteList.innerHTML = data.filter(s=>s.favorite).map((s,i)=>`<button data-dex-id="${esc(s.name)}"><span class="species-badge ${['red','gold','green','blue','ochre'][i%5]}">${abbr(s)}</span>${esc(scientific(s))}</button>`).join('');

  function searchText(s){ return [s.name,s.scientific,s.group,s.period,s.age,s.region,s.diet,s.summary,s.interesting,...(s.tags||[])].join(' ').toLowerCase(); }
  const periodRank = s => { const t=(s.period+' '+s.age).toLowerCase(); if(t.includes('devonian'))return 1;if(t.includes('permian'))return 2;if(t.includes('triassic'))return 3;if(t.includes('jurassic'))return 4;if(t.includes('cretaceous'))return 5;if(t.includes('paleocene'))return 6;if(t.includes('miocene'))return 7;if(t.includes('pliocene'))return 8;if(t.includes('pleistocene'))return 9;return 10; };
  function currentResults(){
    const q=state.query.trim().toLowerCase(); let rows=data.filter(s=>matchFilter(s,state.filter) && (!q || searchText(s).includes(q)));
    if(state.sort==='az')rows.sort((a,b)=>scientific(a).localeCompare(scientific(b))); else if(state.sort==='period')rows.sort((a,b)=>periodRank(a)-periodRank(b)||scientific(a).localeCompare(scientific(b))); else if(state.sort==='notes')rows.sort((a,b)=>Number(noteExists(b))-Number(noteExists(a))||Number(isPersonalFavorite(b))-Number(isPersonalFavorite(a))||scientific(a).localeCompare(scientific(b))); else rows.sort((a,b)=>Number(isPersonalFavorite(b))-Number(isPersonalFavorite(a))||scientific(a).localeCompare(scientific(b))); return rows;
  }
  function completeness(s){ return ['age','size','anatomy','ecology','fossil','uncertainty'].reduce((n,k)=>n+(s[k]?1:0),0); }
  function cardHtml(s){ const gaps=6-completeness(s); return `<article class="dex-record-card ${s.favorite?'favorite':''}"><button class="dex-card-image" data-dex-id="${esc(s.name)}" type="button"><div class="dex-image-placeholder">${abbr(s)}</div><img class="dex-wiki-img" data-wiki-title="${esc(s.wiki)}" alt="${esc(scientific(s))} reference image" loading="lazy">${s.favorite?'<span class="dex-favorite-flag">FEATURED</span>':''}</button><div class="dex-record-copy"><div class="dex-record-category">${esc(s.category)} // ${esc(s.period)}</div><h3>${esc(scientific(s))}</h3><div class="dex-quickfacts"><span>${esc(s.group)}</span><span>${esc(s.region)}</span><span>${esc(s.diet)}</span></div><p>${esc(s.summary)}</p><div class="dex-card-footer"><span class="${gaps?'gap':'complete'}">${gaps?gaps+' RESEARCH GAP'+(gaps===1?'':'S'):'CORE FIELDS SEEDED'}</span>${noteExists(s)?'<span class="has-notes">YOUR NOTES ✓</span>':''}</div><button class="terminal-button dex-open" data-dex-id="${esc(s.name)}" type="button">OPEN DOSSIER <span>▶</span></button></div></article>`; }

  let observer;
  function setupImageObserver(){ observer?.disconnect(); observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);hydrateImage(entry.target);}}),{rootMargin:'300px'}); grid.querySelectorAll('img[data-wiki-title]').forEach(img=>observer.observe(img)); }
  async function fetchWiki(title){
    if(wikiCache.has(title))return wikiCache.get(title);
    const promise=(async()=>{ const params=new URLSearchParams({action:'query',format:'json',origin:'*',redirects:'1',prop:'pageimages|extracts|info',inprop:'url',exintro:'1',explaintext:'1',piprop:'thumbnail|name|original',pithumbsize:'1000',pilicense:'free',titles:title}); const r=await fetch('https://en.wikipedia.org/w/api.php?'+params); if(!r.ok)throw new Error('wiki '+r.status); const j=await r.json(); const p=Object.values(j.query?.pages||{})[0]||{}; const result={title:p.title||title,url:p.fullurl||('https://en.wikipedia.org/wiki/'+encodeURIComponent(title.replaceAll(' ','_'))),extract:p.extract||'',image:p.thumbnail?.source||p.original?.source||'',original:p.original?.source||p.thumbnail?.source||'',file:p.pageimage||'',credit:null};
      if(result.file){try{const cp=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'url|extmetadata',titles:'File:'+result.file});const cr=await fetch('https://commons.wikimedia.org/w/api.php?'+cp);const cj=await cr.json();const cpage=Object.values(cj.query?.pages||{})[0]||{};const ii=cpage.imageinfo?.[0];if(ii)result.credit={artist:stripHtml(ii.extmetadata?.Artist?.value||ii.extmetadata?.Credit?.value||''),license:stripHtml(ii.extmetadata?.LicenseShortName?.value||ii.extmetadata?.UsageTerms?.value||''),source:ii.descriptionurl||result.url};}catch(e){}}
      return result; })().catch(()=>({title,url:'https://en.wikipedia.org/wiki/'+encodeURIComponent(title.replaceAll(' ','_')),extract:'',image:'',original:'',file:'',credit:null})); wikiCache.set(title,promise); return promise;
  }
  async function hydrateImage(img){ if(img.dataset.loaded==='1')return; img.dataset.loaded='1'; const info=await fetchWiki(img.dataset.wikiTitle); if(info.image){img.src=info.image;img.classList.add('loaded');} }
  function updateStats(rows){ const noted=data.filter(noteExists).length; document.getElementById('dexNoteReadout').textContent=String(noted).padStart(3,'0'); statBox.innerHTML=`<div><span>${String(data.length).padStart(3,'0')}</span>Total records</div><div><span>${String(data.filter(s=>s.category==='Dinosaur').length).padStart(3,'0')}</span>Dinosaurs</div><div><span>${String(data.filter(s=>s.category==='Marine Reptile').length).padStart(3,'0')}</span>Marine reptiles</div><div><span>${String(data.filter(s=>s.category==='Pterosaur').length).padStart(3,'0')}</span>Pterosaurs</div><div><span>${String(data.filter(s=>s.category==='Other Prehistoric').length).padStart(3,'0')}</span>Other prehistoric</div><div><span>${String(data.filter(hasGap).length).padStart(3,'0')}</span>Research gaps</div><div><span>${String(noted).padStart(3,'0')}</span>Your noted records</div><div><span>${String(rows.length).padStart(3,'0')}</span>Current results</div>`; }
  function render(){ const rows=currentResults(),visible=rows.slice(0,state.shown); grid.innerHTML=visible.map(cardHtml).join('')||'<div class="dex-no-results">NO RECORDS MATCH CURRENT QUERY</div>'; loadMore.hidden=visible.length>=rows.length; loadMore.textContent=visible.length<rows.length?`LOAD ${Math.min(24,rows.length-visible.length)} MORE RECORDS ▼`:'ALL RECORDS LOADED'; activeFilter.textContent=`${filters.find(x=>x[0]===state.filter)?.[1]||'ALL RECORDS'} // ${rows.length} MATCH${rows.length===1?'':'ES'}`; categoryStack.querySelectorAll('[data-dex-filter]').forEach(b=>b.classList.toggle('active',b.dataset.dexFilter===state.filter)); updateStats(rows); setupImageObserver(); }
  categoryStack.addEventListener('click',e=>{const b=e.target.closest('[data-dex-filter]');if(!b)return;state.filter=b.dataset.dexFilter;state.shown=24;render();}); search.addEventListener('input',()=>{state.query=search.value;state.shown=24;render();}); sort.addEventListener('change',()=>{state.sort=sort.value;render();}); loadMore.addEventListener('click',()=>{state.shown+=24;render();}); document.getElementById('dexRandom').addEventListener('click',()=>{const rows=currentResults();if(rows.length)openDossier(rows[Math.floor(Math.random()*rows.length)]);}); favoriteList.addEventListener('click',e=>{const b=e.target.closest('[data-dex-id]');if(b)openDossier(data.find(s=>s.name===b.dataset.dexId));}); grid.addEventListener('click',e=>{const b=e.target.closest('[data-dex-id]');if(b)openDossier(data.find(s=>s.name===b.dataset.dexId));});

  const modal=document.getElementById('speciesModal'), modalContent=document.getElementById('speciesModalContent'), modalClose=document.getElementById('speciesModalClose');
  function field(label,value){return `<div class="dex-dossier-field ${value?'':'research-gap'}"><span>${label}</span><b>${value?esc(value):'RESEARCH GAP'}</b></div>`;}
  function bullets(items){return items?.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="research-gap-copy">No prompts seeded yet. Add your own question below.</p>';}
  async function openDossier(s){ if(!s)return; modalSpecies=s; const notes=localStorage.getItem(noteKey(s.name))||'',sources=localStorage.getItem(sourceKey(s.name))||'',status=localStorage.getItem(statusKey(s.name))||'Unstudied',starred=isPersonalFavorite(s); modalContent.innerHTML=`<div class="dex-dossier-upgraded"><section class="dex-dossier-hero"><div class="dex-dossier-image-wrap"><div class="dex-dossier-fallback">${abbr(s)}</div><img id="dexModalImage" alt="${esc(scientific(s))} reference image"><div class="dex-image-credit" id="dexImageCredit">REQUESTING FREE REFERENCE IMAGE...</div></div><div class="dex-dossier-heading"><div class="dex-record-category">${esc(s.category)} // ${esc(s.group)}</div><h2>${esc(scientific(s))}</h2>${s.name!==scientific(s)?`<div class="dex-common-label">ARCHIVE LABEL: ${esc(s.name)}</div>`:''}<p>${esc(s.summary)}</p><div class="dex-dossier-actions"><button class="terminal-button" id="dexStarSpecies" type="button">${starred?'★ FAVORITE':'☆ ADD FAVORITE'}</button><select id="dexStudyStatus" class="dex-study-status">${['Unstudied','Reading','Notes started','Reviewed'].map(x=>`<option ${x===status?'selected':''}>${x}</option>`).join('')}</select></div></div></section><section class="dex-dossier-facts">${field('PERIOD',s.period)}${field('AGE',s.age)}${field('REGION',s.region)}${field('DIET',s.diet)}${field('SIZE',s.size)}${field('GROUP',s.group)}</section><section class="dex-reading-grid"><article><h3>WHY IT IS INTERESTING</h3><p>${s.interesting?esc(s.interesting):'<span class="research-gap-copy">Research gap.</span>'}</p></article><article><h3>ANATOMY & BIOLOGY</h3><p>${s.anatomy?esc(s.anatomy):'<span class="research-gap-copy">Research gap.</span>'}</p></article><article><h3>ECOLOGY</h3><p>${s.ecology?esc(s.ecology):'<span class="research-gap-copy">Research gap.</span>'}</p></article><article><h3>FOSSIL RECORD</h3><p>${s.fossil?esc(s.fossil):'<span class="research-gap-copy">Research gap.</span>'}</p></article><article class="wide"><h3>WHAT IS STILL UNCERTAIN?</h3><p>${s.uncertainty?esc(s.uncertainty):'<span class="research-gap-copy">This is intentionally blank. Find an active question or uncertainty worth tracking.</span>'}</p></article><article class="wide"><h3>RESEARCH QUESTIONS</h3>${bullets(s.questions)}</article></section><section class="dex-reference-panel"><div class="dex-reference-head"><h3>LIVE REFERENCE OVERVIEW</h3><span id="dexWikiState">CONTACTING WIKIPEDIA...</span></div><div id="dexWikiExtract" class="dex-wiki-extract">Loading reference material...</div><div class="dex-reference-links" id="dexReferenceLinks"></div></section><section class="dex-personal-research"><div class="dex-research-column"><label>PERSONAL RESEARCH NOTES // SAVED TO THIS BROWSER</label><textarea id="dexPersonalNotes" placeholder="Questions, observations, corrections, reconstruction notes, paper summaries, things to verify...">${esc(notes)}</textarea></div><div class="dex-research-column"><label>SOURCES / PAPERS / LINKS TO REVISIT</label><textarea id="dexPersonalSources" placeholder="Paste paper titles, DOI notes, museum links, books, or citations here...">${esc(sources)}</textarea></div><div class="dex-save-row"><button class="terminal-button" id="dexSaveResearch" type="button">SAVE RESEARCH <span>▶</span></button><span id="dexSaveState"></span></div></section></div>`; modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    document.getElementById('dexStarSpecies').addEventListener('click',e=>{const now=!isPersonalFavorite(s);localStorage.setItem(starKey(s.name),now?'1':'0');e.currentTarget.textContent=now?'★ FAVORITE':'☆ ADD FAVORITE';render();}); document.getElementById('dexStudyStatus').addEventListener('change',e=>localStorage.setItem(statusKey(s.name),e.target.value)); document.getElementById('dexSaveResearch').addEventListener('click',()=>{localStorage.setItem(noteKey(s.name),document.getElementById('dexPersonalNotes').value);localStorage.setItem(sourceKey(s.name),document.getElementById('dexPersonalSources').value);const st=document.getElementById('dexSaveState');st.textContent='SAVED ✓';setTimeout(()=>st.textContent='',1800);render();}); hydrateModalWiki(s);
  }
  async function hydrateModalWiki(s){ const info=await fetchWiki(s.wiki); if(modalSpecies!==s)return; const img=document.getElementById('dexModalImage'),credit=document.getElementById('dexImageCredit'); if(info.original||info.image){img.src=info.original||info.image;img.classList.add('loaded');const parts=[];if(info.credit?.artist)parts.push(info.credit.artist);if(info.credit?.license)parts.push(info.credit.license);credit.innerHTML=`IMAGE: ${esc(parts.join(' • ')||'WIKIMEDIA COMMONS')} // <a href="${esc(info.credit?.source||info.url)}" target="_blank" rel="noopener">SOURCE & LICENSE ↗</a>`;}else credit.textContent='NO FREE PAGE IMAGE RETURNED // ADD IMAGE RESEARCH TO NOTES'; document.getElementById('dexWikiState').textContent=info.extract?'REFERENCE ONLINE':'REFERENCE PAGE AVAILABLE'; document.getElementById('dexWikiExtract').textContent=info.extract||'No introductory extract was returned. Use the source links below as a research starting point.'; const scholar='https://scholar.google.com/scholar?q='+encodeURIComponent('"'+scientific(s)+'"'); document.getElementById('dexReferenceLinks').innerHTML=`<a class="terminal-button" href="${esc(info.url)}" target="_blank" rel="noopener">WIKIPEDIA SOURCE ↗</a><a class="terminal-button" href="${scholar}" target="_blank" rel="noopener">GOOGLE SCHOLAR ↗</a>`; }
  modalClose?.addEventListener('click',()=>{modalSpecies=null;}); modal?.addEventListener('click',e=>{if(e.target===modal)modalSpecies=null;}); render();
})();
