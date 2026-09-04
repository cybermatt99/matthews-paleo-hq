(function(){
  const dataset=Array.isArray(window.JM_DINODEX_DATA)?window.JM_DINODEX_DATA:[];
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const stripHtml=v=>{const d=document.createElement('div');d.innerHTML=v||'';return(d.textContent||d.innerText||'').replace(/\s+/g,' ').trim();};
  const scientific=s=>s?.scientific||s?.name||'';

  /* ---------- universal image viewer ---------- */
  const viewer=document.createElement('div');
  viewer.className='universal-image-viewer';
  viewer.id='universalImageViewer';
  viewer.setAttribute('aria-hidden','true');
  viewer.innerHTML=`<div class="universal-image-frame" role="dialog" aria-modal="true" aria-label="Full-size image viewer"><div class="universal-image-toolbar"><span class="led green"></span><span class="universal-image-caption" id="universalImageCaption">IMAGE VIEWER</span><button class="universal-image-close" id="universalImageClose" type="button" aria-label="Close image viewer">×</button></div><div class="universal-image-stage" id="universalImageStage"><img id="universalImage" alt=""></div><div class="universal-image-footer"><span>CLICK IMAGE: FIT / ACTUAL SIZE</span><a id="universalImageSource" href="#" target="_blank" rel="noopener" hidden>SOURCE / LICENSE ↗</a></div></div>`;
  document.body.appendChild(viewer);
  const viewerImg=document.getElementById('universalImage'),viewerCaption=document.getElementById('universalImageCaption'),viewerSource=document.getElementById('universalImageSource');
  function openViewer(img){
    const full=img.dataset.fullSrc||img.currentSrc||img.src;if(!full)return;
    viewerImg.src=full;viewerImg.alt=img.alt||'Full-size image';viewerCaption.textContent=img.dataset.zoomCaption||img.alt||'FULL-SIZE IMAGE';
    const source=img.dataset.sourceUrl||'';viewerSource.hidden=!source;if(source)viewerSource.href=source;
    viewer.classList.remove('zoomed');viewer.classList.add('open');viewer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }
  function closeViewer(){viewer.classList.remove('open','zoomed');viewer.setAttribute('aria-hidden','true');viewerImg.src='';if(!document.querySelector('.species-modal.open,.photo-lightbox.open'))document.body.style.overflow='';}
  document.getElementById('universalImageClose').addEventListener('click',closeViewer);
  document.getElementById('universalImageStage').addEventListener('click',e=>{if(e.target===viewerImg)viewer.classList.toggle('zoomed');});
  viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer();});
  document.addEventListener('click',e=>{
    const img=e.target.closest('img');
    if(!img||viewer.contains(img)||img.classList.contains('no-zoom'))return;
    if(!img.src&&!img.currentSrc)return;
    e.preventDefault();e.stopImmediatePropagation();openViewer(img);
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&viewer.classList.contains('open')){e.stopImmediatePropagation();closeViewer();}},true);

  /* ---------- Wikimedia Commons media search ---------- */
  const mediaCache=new Map();
  async function commonsSearch(query){
    const key='search:'+query;if(mediaCache.has(key))return mediaCache.get(key);
    const promise=(async()=>{
      const p=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'12',prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'1600'});
      const r=await fetch('https://commons.wikimedia.org/w/api.php?'+p);if(!r.ok)throw new Error('commons '+r.status);const j=await r.json();
      return Object.values(j.query?.pages||{}).map(page=>{const ii=page.imageinfo?.[0]||{},m=ii.extmetadata||{};return{title:page.title||'',display:ii.thumburl||ii.url||'',full:ii.url||ii.thumburl||'',source:ii.descriptionurl||'',width:ii.width||0,height:ii.height||0,artist:stripHtml(m.Artist?.value||m.Credit?.value||''),credit:stripHtml(m.Credit?.value||''),license:stripHtml(m.LicenseShortName?.value||m.UsageTerms?.value||''),licenseUrl:stripHtml(m.LicenseUrl?.value||''),description:stripHtml(m.ImageDescription?.value||'')};}).filter(x=>x.display&&x.full);
    })().catch(()=>[]);mediaCache.set(key,promise);return promise;
  }
  const rejectWords=['map','range','cladogram','phylogeny','logo','icon','diagram','size comparison','chart','graph','timeline','stamp','coin','toy','poster'];
  function scoreCandidate(c,mode){
    const t=(c.title+' '+c.description).toLowerCase();if(rejectWords.some(w=>t.includes(w)))return-100;
    let score=Math.min((c.width||0)/900,2.5);
    if(mode==='evidence'){
      ['skeleton','skeletal','fossil','skull','specimen','mount','bones','cast'].forEach(w=>{if(t.includes(w))score+=3;});
      ['restoration','reconstruction','life','paleoart','illustration','artist'].forEach(w=>{if(t.includes(w))score-=2.5;});
    }else{
      ['restoration','reconstruction','life','paleoart','illustration','artist impression'].forEach(w=>{if(t.includes(w))score+=3;});
      ['skeleton','skeletal','fossil','skull','specimen','mount','bones'].forEach(w=>{if(t.includes(w))score-=2.5;});
    }
    if(c.license)score+=.6;return score;
  }
  async function findCommonsMedia(name,mode){
    const key=mode+':'+name;if(mediaCache.has(key))return mediaCache.get(key);
    const promise=(async()=>{
      const qs=mode==='evidence'?[`${name} skeleton`,`${name} fossil`,`${name} skull`]:[`${name} life restoration`,`${name} reconstruction`,`${name} paleoart`];
      let best=null,bestScore=-999;
      for(const q of qs){const rows=await commonsSearch(q);for(const c of rows){const s=scoreCandidate(c,mode);if(s>bestScore){best=c;bestScore=s;}}if(bestScore>=4.5)break;}
      return bestScore>-50?best:null;
    })();mediaCache.set(key,promise);return promise;
  }

  /* ---------- Dino-Dex dossier media switcher ---------- */
  function findSpeciesFromDossier(root){const h=root.querySelector('.dex-dossier-heading h2');if(!h)return null;const title=h.textContent.trim().toLowerCase();return dataset.find(s=>scientific(s).toLowerCase()===title||String(s.name).toLowerCase()===title)||null;}
  function mediaCreditHtml(media,label){
    if(!media)return`<strong>${label}</strong> // NO SUITABLE FREE IMAGE FOUND. THIS IS A GOOD RESEARCH GAP.`;
    const who=media.artist||media.credit||'Wikimedia Commons contributor';const lic=media.license||'Free media on Wikimedia Commons';
    return`<strong>${label}</strong> // ${esc(who)} <span class="license">• ${esc(lic)}</span> // <a href="${esc(media.source)}" target="_blank" rel="noopener">SOURCE & LICENSE ↗</a><span class="dex-media-hint">CLICK IMAGE FOR FULL SIZE</span>`;
  }
  function enhanceDossier(root){
    if(!root||root.dataset.mediaEnhanced==='1')return;const species=findSpeciesFromDossier(root);if(!species)return;
    const wrap=root.querySelector('.dex-dossier-image-wrap');if(!wrap)return;root.dataset.mediaEnhanced='1';root.classList.add('dex-media-enhanced');
    const oldImage=wrap.querySelector('#dexModalImage');
    const tabs=document.createElement('div');tabs.className='dex-media-tabs';tabs.innerHTML='<button class="dex-media-tab active" data-media-mode="evidence" type="button" disabled>FOSSIL / SKELETAL EVIDENCE</button><button class="dex-media-tab" data-media-mode="life" type="button" disabled>LIFE RECONSTRUCTION</button>';
    const stage=document.createElement('div');stage.className='dex-media-stage';stage.innerHTML=`<div class="dex-media-placeholder">${esc((species.name.match(/[A-Za-z]+/g)||['?']).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</div><div class="dex-media-state">LOCATING FREE MEDIA...</div><img class="dex-media-image" alt="${esc(scientific(species))}">`;
    const credit=document.createElement('div');credit.className='dex-media-credit';credit.textContent='QUERYING WIKIMEDIA COMMONS FOR EVIDENCE AND LIFE-RECONSTRUCTION MEDIA...';
    wrap.append(tabs,stage,credit);
    const display=stage.querySelector('.dex-media-image'),status=stage.querySelector('.dex-media-state'),buttons=[...tabs.querySelectorAll('.dex-media-tab')];
    const media={evidence:null,life:null};let mode='evidence';
    function show(which){const m=media[which];if(!m)return;mode=which;buttons.forEach(b=>b.classList.toggle('active',b.dataset.mediaMode===which));display.src=m.display;display.dataset.fullSrc=m.full;display.dataset.sourceUrl=m.source;display.dataset.zoomCaption=`${scientific(species)} // ${which==='evidence'?'fossil or skeletal reference':'life reconstruction'}`;display.alt=`${scientific(species)} ${which==='evidence'?'fossil or skeletal reference':'life reconstruction'}`;credit.innerHTML=mediaCreditHtml(m,which==='evidence'?'FOSSIL / SKELETAL EVIDENCE':'LIFE RECONSTRUCTION');status.textContent=which==='evidence'?'EVIDENCE VIEW':'RECONSTRUCTION VIEW';}
    buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.mediaMode)));
    Promise.all([findCommonsMedia(scientific(species),'evidence'),findCommonsMedia(scientific(species),'life')]).then(async([evidence,life])=>{
      if(!evidence&&oldImage){for(let i=0;i<20&&!oldImage.src;i++)await new Promise(r=>setTimeout(r,100));if(oldImage.src)evidence={display:oldImage.src,full:oldImage.src,source:'',artist:'Wikipedia primary reference',license:'See original dossier source',description:''};}
      media.evidence=evidence;media.life=life;buttons[0].disabled=!evidence;buttons[1].disabled=!life;buttons[1].title=life?'Freely licensed life reconstruction from Wikimedia Commons':'No suitable freely licensed reconstruction was located automatically';
      status.textContent=(evidence||life)?'MEDIA ONLINE':'MEDIA SEARCH INCOMPLETE';
      if(evidence)show('evidence');else if(life)show('life');else credit.innerHTML=mediaCreditHtml(null,'MEDIA');
    });
  }
  const modalContent=document.getElementById('speciesModalContent');
  if(modalContent){const observer=new MutationObserver(()=>{const root=modalContent.querySelector('.dex-dossier-upgraded');if(root)enhanceDossier(root);});observer.observe(modalContent,{childList:true,subtree:true});const existing=modalContent.querySelector('.dex-dossier-upgraded');if(existing)enhanceDossier(existing);}
})();
