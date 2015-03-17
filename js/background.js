// show page action
function showPageAction(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    url = tab.url;
    if (!IsValidUrl(url)) {
      return ;
    }

    chrome.pageAction.show(tabId);
/*
    chrome.tabs.executeScript({
      code: 'var images = document.images; \
      console.log(images); \
      if (images.length > 0) { \
        chrome.pageAction.show(tabId); };'
    });
//    chrome.tabs.executeScript(null, {file: "slide.js"});
/*    imgList = getImageList();
    if (imgList.length) {
      chrome.pageAction.show(tabId);
    }*/
  });
}

function IsValidUrl(url) {
  var items = localStorage.getItem("allowed_slideview_websites");
  if (items) {
    weblist = JSON.parse(items);
    for (i=0; i < weblist.length; ++i) {
      startPos = url.indexOf('.');
      if (-1 == startPos) {
        continue;
      }
      ipos = url.indexOf('/', startPos);
      if (-1 != ipos) {
        domain_url = url.substr(0, ipos);
        if (-1 != domain_url.indexOf(weblist[i])) {
          return true;
        }
      }
    }
  }

  return false;
}

chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  showPageAction(tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId) {
  showPageAction(tabId)
});


// add function for page action
chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.insertCSS(null, {file: "bootstrap/css/bootstrap.min.css"});
  chrome.tabs.insertCSS(null, {file: "css/slide.css"});
  chrome.tabs.executeScript(null, {file: "js/jquery-2.1.3.min.js"});
  chrome.tabs.executeScript(null, {file: "bootstrap/js/bootstrap.min.js"});
  chrome.tabs.executeScript(null, {file: "js/slide.js"}, function() {
    var items = localStorage.getItem("general_options");
    if (items) {
      optlist = JSON.parse(items);
      chrome.tabs.sendMessage(tab.id, optlist)
    }
  });
});

