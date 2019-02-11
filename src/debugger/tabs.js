const tabs = () => {
  const tabCollections = document.querySelectorAll("[data-tabs]");

  const handleShowTab = (tabID, event) => {
    event.preventDefault();

    const tabs = document.querySelectorAll(`[data-tabs="${tabID}"] .tab > a`);
    tabs.forEach(tab => hideTab(tab));

    event.target.classList.add("active");
    document.querySelector(event.target.dataset.tab).classList.remove("hidden");
  };

  const hideTab = tab => {
    tab.classList.remove("active");
    document.querySelector(`${tab.dataset.tab}`).classList.add("hidden");
  };

  const initTabs = tabID => {
    const tabs = document.querySelectorAll(`[data-tabs="${tabID}"] a`);
    tabs.forEach(tab => {
      tab.addEventListener("mousedown", handleShowTab.bind(null, tabID));

      if (!tab.classList.contains("active")) {
        hideTab(tab);
      }
    });
  };

  tabCollections.forEach(collection => initTabs(collection.dataset.tabs));
};

export { tabs };
