const tabs = () => {
  const tabCollections = document.querySelectorAll("[data-tabs]");

  const handleShowTab = (tabsID, tabID, event) => {
    event.preventDefault();

    const tabs = document.querySelectorAll(`[data-tabs="${tabsID}"] .tab > a`);
    const tab = document.querySelector(`[data-tab="${tabID}"]`);
    const tabContent = document.querySelector(tab.dataset.tab);

    tabs.forEach(tab => hideTab(tab));
    tab.classList.add("active");
    tabContent.classList.remove("hidden");

    const tabContentBounding = tabContent.getBoundingClientRect();

    if (tabContentBounding.top < 0) {
      window.scrollTo(0, 0);
    }
  };

  const hideTab = tab => {
    tab.classList.remove("active");
    document.querySelector(`${tab.dataset.tab}`).classList.add("hidden");
  };

  const initTabs = tabsID => {
    const tabs = document.querySelectorAll(`[data-tabs="${tabsID}"] a`);
    const triggers = document.querySelectorAll('[data-tab-trigger]');

    tabs.forEach(tab => {
      tab.addEventListener("mousedown", handleShowTab.bind(null, tabsID, tab.dataset.tab));

      if (!tab.classList.contains("active")) {
        hideTab(tab);
      }
    });

    triggers.forEach(trigger => {
      const tabsID = trigger.dataset.tabTrigger.split('.')[0];
      const tab = trigger.dataset.tabTrigger.split('.')[1];
      trigger.addEventListener('click', event => handleShowTab(tabsID, tab, event));
    });
  };

  tabCollections.forEach(collection => initTabs(collection.dataset.tabs));
};

export { tabs };
