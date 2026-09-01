(function(){
const buttons=document.querySelectorAll('.nav-btn');
const pages=document.querySelectorAll('.page');
function go(page){
pages.forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
buttons.forEach(b=>b.classList.toggle('active',b.dataset.page===page));
window.location.hash=page;
window.scrollTo({top:0,behavior:'smooth'});
}
buttons.forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.goto)));
const hash=location.hash.replace('#','');
if(hash&&document.getElementById('page-'+hash))go(hash);
let count=Number(localStorage.getItem('paleoHQVisits')||'0')+1;
localStorage.setItem('paleoHQVisits',String(count));
document.getElementById('visitCounter').textContent=String(count).padStart(7,'0');
})();