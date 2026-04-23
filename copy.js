(function(){

  if (window.mgLoaded) {
    console.log("Already loaded. Press O.");
    return;
  }
  window.mgLoaded = true;

  let rigged = localStorage.getItem("mg_rigged") === "true";
  let chance = parseFloat(localStorage.getItem("mg_chance")) || 100;

  function saveSettings(){
    localStorage.setItem("mg_rigged", rigged);
    localStorage.setItem("mg_chance", chance);
  }

  if (!window._origRandom) window._origRandom = Math.random;

  function applyRig(){
    if (!rigged) {
      Math.random = window._origRandom;
      return;
    }

    Math.random = function(){
      return (window._origRandom() < (chance/100)) ? 0.99 : window._origRandom();
    };
  }

  setInterval(applyRig, 1000);
  applyRig();

  function applyValues(){
    chrome.storage.sync.get("game_data", data=>{
      let g = data.game_data || {};

      let money = parseFloat(document.getElementById("mg_money").value);
      let bonus = parseFloat(document.getElementById("mg_bonus").value);
      let prestige = parseFloat(document.getElementById("mg_prestige").value);

      if (!isNaN(money)) g.balance = money;
      if (!isNaN(bonus)) g.bonus_clicks = bonus;
      if (!isNaN(prestige)) g.prestige_points = prestige;

      chrome.storage.sync.set({game_data:g}, ()=>location.reload());
    });
  }

  function toggleMenu(){
    let existing = document.getElementById("mg_menu");
    if (existing) return existing.remove();

    const wrap = document.createElement("div");
    wrap.id = "mg_menu";
    wrap.style = `
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      background:#111;
      color:#fff;
      padding:12px;
      border-radius:10px;
      z-index:999999;
      font-family:sans-serif;
      width:220px;
      box-shadow:0 0 12px rgba(0,0,0,0.6);
      text-align:center;
    `;

    wrap.innerHTML = `
      <div style="font-size:14px;margin-bottom:8px;">MoneyMenuV5</div>

      <input id="mg_money" style="width:90%;font-size:11px;padding:4px" placeholder="Money"><br><br>
      <input id="mg_bonus" style="width:90%;font-size:11px;padding:4px" placeholder="Bonus"><br><br>
      <input id="mg_prestige" style="width:90%;font-size:11px;padding:4px" placeholder="Prestige"><br><br>

      <button id="mg_apply" style="width:95%;font-size:11px;margin-bottom:6px;padding:5px;">
        Apply Upper Buttons.
      </button>

      <button id="mg_toggle_rig" style="width:95%;font-size:11px;margin-bottom:6px;padding:5px;">
      </button>

      <input id="mg_chance" type="number" min="0" max="100"
        style="width:90%;font-size:11px;padding:4px" value="${chance}">

      <div style="font-size:10px;opacity:0.7;margin-top:6px;">
        O = toggle menu
      </div>
    `;

    document.body.appendChild(wrap);

    document.getElementById("mg_apply").onclick = applyValues;

    document.getElementById("mg_toggle_rig").onclick = ()=>{
      rigged = !rigged;
      saveSettings();
      applyRig();
      updateMenu();
    };

    document.getElementById("mg_chance").oninput = (e)=>{
      chance = Math.max(0, Math.min(100, parseFloat(e.target.value)||0));
      saveSettings();
    };

    updateMenu();
  }

  function updateMenu(){
    let btn = document.getElementById("mg_toggle_rig");
    if (btn) btn.textContent = "Rigging: " + (rigged ? "ON" : "OFF");
  }

  document.addEventListener("keydown", (e)=>{
    if (e.key.toLowerCase() === "o") toggleMenu();
  });

  console.log("Loaded. Press O.");

})();
