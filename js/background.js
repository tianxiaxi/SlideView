// show page action
function showPageAction(tabId) {
  chrome.pageAction.show(tabId);
}

chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  showPageAction(tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId) {
  showPageAction(tabId)
});


// add function for page action
chrome.pageAction.onClicked.addListener(function(tab) {

});

