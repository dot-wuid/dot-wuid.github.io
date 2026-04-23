chrome.storage.sync.remove("game_data", () => {
  console.log("Game data cleared!");
  location.reload();
});
