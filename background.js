chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: "OFF",
    });
  });

const extensions = 'https://developer.chrome.com/docs/extensions'
const webstore = 'https://developer.chrome.com/docs/webstore'

chrome.action.onClicked.addListener(async (tab) => {
    console.log("I am URL: ", tab.url)
  if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    console.log("I am tab id: ", tab.id)
    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    if (nextState === "ON") {
        // Insert the CSS file when the user turns the extension on
        await chrome.scripting.insertCSS({
          files: ["focus-mode.css"],
          target: { tabId: tab.id },
        });
      } else if (nextState === "OFF") {
        // Remove the CSS file when the user turns the extension off
        await chrome.scripting.removeCSS({
          files: ["focus-mode.css"],
          target: { tabId: tab.id },
        });
      }
  }
});

// let currentTabId = null;
// let startTime = null;

// console.log(" I AM WORKING CODE....")
// chrome.tabs.onActivated.addListener((activeInfo) => {
//     console.log("A TAB IS ACTIVATED....")
//   if (currentTabId && startTime) {
//     const timeSpent = (Date.now() - startTime) / 1000;
//     console.log(`Time spent on tab ${currentTabId}: ${timeSpent} seconds`);
//     // Save the time spent to storage or send it to your server
//   }

//   currentTabId = activeInfo.tabId;
//   startTime = Date.now();
// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     console.log("URL CHANGED: TAB UPDATED")
//   if (tabId === currentTabId && changeInfo.status === 'complete') {
//     startTime = Date.now();
//   }
// });

let activeTabId = null;
let startTime = null;
let tabTimes = {};

chrome.tabs.onActivated.addListener(activeInfo => {
  updateTimeForPreviousTab();
  activeTabId = activeInfo.tabId;
  startTime = Date.now();
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    updateTimeForPreviousTab();
    activeTabId = null;
  } else {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      if (tabs.length > 0) {
        updateTimeForPreviousTab();
        activeTabId = tabs[0].id;
        startTime = Date.now();
      }
    });
  }
});

function updateTimeForPreviousTab() {
  if (activeTabId && startTime) {
    const activeTime = Date.now() - startTime;
    if (!tabTimes[activeTabId]) {
      tabTimes[activeTabId] = 0;
    }
    tabTimes[activeTabId] += activeTime;
    chrome.storage.local.set({tabTimes: tabTimes});
  }
}

function getTabCount(callback) {
    chrome.tabs.query({}, function(tabs) {
      callback(tabs.length);
    });
  }

  function getTabCountCurrent(callback) {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      callback(tabs.length);
    });
  }

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    updateTabCount();
  if (tabTimes[tabId]) {
    delete tabTimes[tabId];
    chrome.storage.local.set({tabTimes: tabTimes});
  }
});

let tabCount = 0;
let tabCountCurrent = 0;

// function updateTabCount() {
//   getTabCount(function(count) {
//     tabCount = count;
//     // You can use chrome.runtime.sendMessage here to send the count to your popup if needed
//     console.log("TAB COUNT: ", tabCount)
//   });
// }

// function updateTabCountCurrent() {
//     getTabCountCurrent(function(count) {
//         tabCountCurrent = count;
//         console.log("TAB COUNT Current: ", tabCountCurrent)
//       // You can use chrome.runtime.sendMessage here to send the count to your popup if needed
//     });
//   }

function updateTabCount() {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        // Update count logic here
        console.log("KUCH KUCH: ", tabs)
        tabCount = tabs.length;
        resolve();
      });
    });
  }
  
  function getTabCount() {
    return new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs.length);
      });
    });
  }
  

// chrome.tabs.onRemoved.addListener(updateTabCount);
// chrome.tabs.onCreated.addListener((tab) => {
//     // Call the updateTabCount function
//     updateTabCount();
//     updateTabCountCurrent();

//     // Additional code you want to run when a new tab is created
//     console.log('New tab created:', tab.id);
  
//     // Example: Log the URL of the new tab (if available)
//     if (tab.url) {
//       console.log('New tab URL:', tab.url);
//     }
  
//     // Example: Send a message to the newly created tab
//     chrome.tabs.sendMessage(tab.id, {message: "Hello new tab!"}, function(response) {
//       if (chrome.runtime.lastError) {
//         console.log("Error sending message to new tab:", chrome.runtime.lastError);
//       } else {
//         console.log("Message sent to new tab");
//       }
//     });
  
//     // Example: Update badge text with current tab count
//     getTabCount((count) => {
//       chrome.action.setBadgeText({text: count.toString()});
//     });
  
//     // Example: Save the creation time of the tab
//     let tabInfo = {};
//     tabInfo[tab.id] = {createdAt: new Date().toISOString()};
//     chrome.storage.local.set(tabInfo, () => {
//       console.log('Tab creation time saved');
//     });
//   });

chrome.tabs.onCreated.addListener((tab) => {
    (async () => {
      try {
        // Call the updateTabCount function
        await updateTabCount();
  
        // Additional code you want to run when a new tab is created
        console.log('New tab created:', tab.id);
  
        console.log("I am TAB: ", tab)
        console.log("I am TAB URL: ", tab?.url)
        // Example: Log the URL of the new tab (if available)
        if (tab.url) {
          console.log('New tab URL:', tab.url);
        }

        if (tabCount > 34) {
            closeCurrentTab()
        }
  
        // Example: Send a message to the newly created tab
        await new Promise((resolve) => {
          chrome.tabs.sendMessage(tab.id, {message: "Hello new tab!"}, (response) => {
            if (chrome.runtime.lastError) {
              console.log("Error sending message to new tab:", chrome.runtime.lastError);
            } else {
              console.log("Message sent to new tab");
            }
            resolve();
          });
        });
  
        // Example: Update badge text with current tab count
        const count = await new Promise((resolve) => getTabCount(resolve));
        await new Promise((resolve) => {
          chrome.action.setBadgeText({text: count.toString()}, resolve);
        });
  
        // Example: Save the creation time of the tab
        let tabInfo = {};
        tabInfo[tab.id] = {createdAt: new Date().toISOString()};
        await new Promise((resolve) => {
          chrome.storage.local.set(tabInfo, () => {
            console.log('Tab creation time saved');
            resolve();
          });
        });
      } catch (error) {
        console.error('Error in onCreated listener:', error);
      }
    })();
  });

// // Initial count
// updateTabCount();
// updateTabCountCurrent();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === "getTabCount") {
        getTabCount(function(count) {
          sendResponse({count: count});
        });
        return true;  // Will respond asynchronously
      }
    }
  );

  function closeCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        chrome.tabs.remove(tabs[0].id, function() {
          if (chrome.runtime.lastError) {
            console.error("Error closing tab:", chrome.runtime.lastError);
          } else {
            console.log("Current tab closed successfully");
          }
        });
      } else {
        console.log("No active tab found");
      }
    });
  }