navigator.serviceWorker?.register('sw.js');

window.addEventListener('DOMContentLoaded', () => {
    document.body.textContent = window.location.href;
});