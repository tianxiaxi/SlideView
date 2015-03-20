function detectLanguage() {
  var href = window.location.href;
  var lang = chrome.i18n.getUILanguage();
  if (!lang) {
    return ;
  }
  pos = lang.indexOf('-');
  if (-1 != pos) {
    lang = lang.substr(0, pos);
  }
  if ('zh' == lang) {
    tab_url = chrome.extension.getURL('views/options-cn.html');
    if (tab_url != href) {
      window.location.href = tab_url;
    }
  }
  //console.log(lang);
}

$(document).ready(function() {
  document.title = "SlideView Options";

  detectLanguage();

  LoadAllowedWebsite();

  LoadGeneralOptions();

  // event
  $('input.opt_items').click(function() {
    var checked = $(this).is(':checked');
    var id = $(this).attr('id');
    var items = localStorage.getItem("general_options");
    if (items) {
      optlist = JSON.parse(items);
      for (i=0; i < optlist.length; ++i) {
        var opt_item = optlist[i];
        if (opt_item.id == id) {
          opt_item.value = checked;
          localStorage.setItem("general_options", JSON.stringify(optlist));
          return ;
        }
      }
      // no exist setting found
      var li = new Object;
      li.id = $(this).attr('id');
      li.value = false;
      optlist.push(li);
      localStorage.setItem("general_options", JSON.stringify(optlist));
    }
  });

  $('#website').keyup(function() {
    $('#error_tips').text('');
  });

  $('#AddWebsite').click(function() {
    var url = $('#website').val();
    if (!url.length) {
      return ;
    }
    if (!ValideUrl(url)) {
      $('#error_tips').text('Error: Valid url found ' + url + '!');
      $('#website').select();
      return ;
    }
    var items = localStorage.getItem("allowed_slideview_websites");
    if (items) {
      weblist = JSON.parse(items);
      for (i=0; i < weblist.length; ++i) {
        if (weblist[i] == url) {
          $('#error_tips').text('Error: ' + url + 'has already added!');
          $('#website').select();
          return ;
        }
      }
      weblist.push(url);
      localStorage.setItem("allowed_slideview_websites", JSON.stringify(weblist));
      $('#website').val('');
    }
    LoadAllowedWebsite();
  });
})

function ValideUrl(url) {
  return true;
}

function LoadAllowedWebsite() {
  $('#allowed_website_list').empty();
  var cnt = 0;
  var items = localStorage.getItem("allowed_slideview_websites");
  if (items) {
    weblist = JSON.parse(items);
    cnt = weblist.length;
    for (i=0; i < cnt; ++i) {
      tr = '<tr><td>' + weblist[i] + '</td>';
      td = '<span class="remove_item" id="' + weblist[i] + '">Remove</span>';
      tr += '<td>' + td + '</td></tr>';
      $('#allowed_website_list').append(tr);
    }
  } else {
    weblist = JSON.parse("[]");
    localStorage.setItem("allowed_slideview_websites", JSON.stringify(weblist));
  }

  if (cnt <= 0) {
    $('#tips').hide();
  }

  $('span.remove_item').click(function() {
    var url = $(this).attr('id');
    var items = localStorage.getItem("allowed_slideview_websites");
    if (items) {
      weblist = JSON.parse(items);
      for (i=0; i < weblist.length; ++i) {
        if (weblist[i] == url) {
          weblist.splice(i, 1);
          break;
        }
      }
      localStorage.setItem("allowed_slideview_websites", JSON.stringify(weblist));
    }
    $(this).parent().parent().remove();
  });
}

function LoadGeneralOptions() {
  var items = localStorage.getItem("general_options");
  if (items) {
    optlist = JSON.parse(items);
    for (i=0; i < optlist.length; ++i) {
      var opt_item = optlist[i];
      $('input.opt_items').each(function() {
        if ($(this).attr('id') == opt_item.id) {
          if (opt_item.value) {
            $(this).attr('checked', true);
          } else {
            $(this).attr('checked', false);
          }
        }
      });
    }
  } else {
    optlist = JSON.parse("[]");
    $('input.opt_items').each(function() {
      var li = new Object;
      li.id = $(this).attr('id');
      li.value = false;
      optlist.push(li);
    });
    localStorage.setItem("general_options", JSON.stringify(optlist));
  }
}
