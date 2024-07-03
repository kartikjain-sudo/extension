// document.addEventListener('DOMContentLoaded', function() {
//     chrome.storage.local.get(['tabTimes'], function(result) {
//       const tabTimes = result.tabTimes || {};
//       const timesDiv = document.getElementById('times');
      
//       for (let tabId in tabTimes) {
//         const seconds = Math.floor(tabTimes[tabId] / 1000);
//         const minutes = Math.floor(seconds / 60);
//         const hours = Math.floor(minutes / 60);
        
//         chrome.tabs.get(parseInt(tabId), function(tab) {
//           const url = tab ? tab.url : 'Unknown Tab';
//           timesDiv.innerHTML += `<p>${url}: ${hours}h ${minutes % 60}m ${seconds % 60}s</p>`;
//         });
//       }
//     });
//   });

// document.addEventListener('DOMContentLoaded', function() {
//     chrome.runtime.sendMessage({action: "getTabCount"}, function(response) {
//       document.getElementById('tabCount').textContent = response.count;
//     });
//   });