/*
  DUSKCORE — Match Lock Guard
  ---------------------------
  Include this on EVERY page except Prechees.html itself, right after <body> opens:

      <script src="matchlock.js"></script>

  If the user has an unresolved chess match (they haven't clicked Quit or
  submitted a result screenshot on Prechees.html), this immediately redirects
  them back to that page with the same match details, no matter how they
  arrived — closing the tab and reopening the site, using the browser back
  button, tapping a bookmark, etc.

  The lock is written by Prechees.html on load and cleared only when the
  user clicks "Quit" (forfeit) or successfully submits the result.
*/
(function () {
  var LOCK_KEY = 'dusk_active_match';

  try {
    var raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return;

    var currentPage = window.location.pathname.split('/').pop().toLowerCase();
    if (currentPage === 'prechees.html') return; // already there, don't loop

    var m = JSON.parse(raw);
    var qs = new URLSearchParams({
      id: m.id || '',
      room: m.room || '',
      opponent: m.opponent || '',
      oroom: m.oroom || '',
      coin: m.coin || ''
    }).toString();

    window.location.href = 'Prechees.html?' + qs;
  } catch (e) {
    // Corrupted lock data — clear it rather than trap the user forever
    localStorage.removeItem(LOCK_KEY);
  }
})();

