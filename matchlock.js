/*
  DUSKCORE — Match Lock Guard (v2)
  --------------------------------
  Weka mstari huu KATIKA <head>, mwanzoni kabisa, kwenye KILA ukurasa
  isipokuwa Prechees.html mwenyewe:

      <script src="matchlock.js"></script>

  Ukiuweka ndani ya <head> (siyo baada ya <body>), redirect inatokea
  KABLA ukurasa haujaonekana kwa mtumiaji — hakuna "flash" ya dashboard
  au login kabla ya kurudishwa Prechees.html.

  Tabaka mbili za ulinzi:
  1) FAST PATH — localStorage. Hii inabaki hata simu ikizimwa kabisa,
     kwa sababu localStorage siyo memory, ni hifadhi ya kudumu. Inafutwa
     tu wakati mtumiaji abonyeze Quit au afanikiwe ku-submit matokeo.
  2) SAFETY NET — inauliza database moja kwa moja kwa username aliyeko
     kwenye localStorage. Hii inasaidia hata kama localStorage imefutwa
     (mfano: amefuta cache ya browser) lakini bado ana mechi ambayo
     haijakamilika (status siyo 'completed' wala 'cancelled').
*/
(function () {
  var LOCK_KEY = 'dusk_active_match';
  var currentPage = window.location.pathname.split('/').pop().toLowerCase();
  if (currentPage === 'prechees.html') return; // tayari yupo pale, usimrudishe tena

  function goToMatch(m) {
    var qs = new URLSearchParams({
      id: m.id || '',
      room: m.room || '',
      opponent: m.opponent || '',
      oroom: m.oroom || '',
      coin: m.coin || ''
    }).toString();
    window.location.href = 'Prechees.html?' + qs;
  }

  // ---------- 1. FAST PATH: localStorage ----------
  try {
    var raw = localStorage.getItem(LOCK_KEY);
    if (raw) {
      goToMatch(JSON.parse(raw));
      return;
    }
  } catch (e) {
    localStorage.removeItem(LOCK_KEY);
  }

  // ---------- 2. SAFETY NET: database check ----------
  var username = localStorage.getItem('dusk_username');
  if (!username) return; // hajalogin, hakuna cha kuangalia

  function checkServer() {
    try {
      var sb = supabase.createClient(
        "https://ldgnyehqrharqvynohla.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ255ZWhxcmhhcnF2eW5vaGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzgzMDcsImV4cCI6MjA5NDYxNDMwN30.80vZuD20je-8VKDJwoy7P2mFYqY9Vcq3nMd9K-pHYBI"
      );

      sb.from('chess-quick-match')
        .select('*')
        .eq('username', username)
        .not('status', 'in', '("completed","cancelled")')
        .order('created_at', { ascending: false })
        .limit(1)
        .then(function (res) {
          if (res.data && res.data.length > 0) {
            var row = res.data[0];
            var m = {
              id: row.id,
              room: row.roomcode,
              opponent: row.opponent || '',
              coin: row.coin
            };
            // rejesha lock ili fast path ifanye kazi safari ijayo
            localStorage.setItem(LOCK_KEY, JSON.stringify(m));
            goToMatch(m);
          }
        });
    } catch (e) {
      // kimya kimya — usimzuie mtumiaji kama kuna tatizo la mtandao
    }
  }

  if (typeof supabase !== 'undefined') {
    checkServer();
  } else {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = checkServer;
    document.head.appendChild(s);
  }
})();

