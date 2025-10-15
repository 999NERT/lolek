// === BLOKADA PRAWEGO PRZYCISKU I SKRÓTÓW ===
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.addEventListener('keydown', function(e) {
  // Ctrl+U
  if(e.ctrlKey && e.key.toLowerCase() === 'u'){
    e.preventDefault();
    alert("Wyświetlanie źródła strony jest zablokowane!");
  }
  // F12
  if(e.key === "F12"){
    e.preventDefault();
    alert("Otwieranie DevTools jest zablokowane!");
  }
  // Ctrl+Shift+I
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i'){
    e.preventDefault();
    alert("Otwieranie DevTools jest zablokowane!");
  }
});
