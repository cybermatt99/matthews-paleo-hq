(function(){
  if(!document.querySelector('link[href="dinodex-upgrade.css"]')){
    const link=document.createElement('link');link.rel='stylesheet';link.href='dinodex-upgrade.css';document.head.appendChild(link);
  }
  const files=['dinodex-part-1.js','dinodex-part-2.js','dinodex-part-3.js','dinodex-part-4.js','dinodex-part-5.js','dinodex-part-6.js','dinodex-data-init.js','dinodex-upgrade.js'];
  let i=0;
  function next(){if(i>=files.length)return;const s=document.createElement('script');s.src=files[i++];s.onload=next;s.onerror=next;document.body.appendChild(s);}
  next();
})();