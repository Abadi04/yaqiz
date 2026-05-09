// ─── Premium Module ───
const Premium = (() => {
  function showModal() {
    document.getElementById('premium-modal').classList.add('active');
  }
  function hideModal() {
    document.getElementById('premium-modal').classList.remove('active');
  }
  function init() {
    document.getElementById('modal-close').onclick = hideModal;
    document.getElementById('premium-modal').onclick = (e) => {
      if (e.target === document.getElementById('premium-modal')) hideModal();
    };
  }
  return { showModal, hideModal, init };
})();
