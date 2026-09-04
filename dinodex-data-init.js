window.JM_DINODEX_DATA=(window.JM_DINODEX_PARTS||[]).flat();
(function(){
  const count=window.JM_DINODEX_DATA.length;
  const preview=document.querySelector('.dex-count strong');
  const label=document.querySelector('.dex-count span');
  if(preview) preview.textContent=String(count).padStart(3,'0');
  if(label) label.textContent='SPECIES SEEDED';
})();