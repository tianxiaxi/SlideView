var oldScrollY = undefined;
var allow_thumbnail = false;
var ignore_repeat = false;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  for (i=0; i < msg.length; ++i) {
    var opt_item = msg[i];
    if (opt_item.id == 'allow_thumbnail') {
      allow_thumbnail = opt_item.value;
    } else if (opt_item.id == 'ignore_repeat') {
      ignore_repeat = opt_item.value;
    }
  }
//  alert('allow_thumbnail: ' + allow_thumbnail);
//  alert('ignore_repeat: ' + ignore_repeat);

  if (undefined == oldScrollY) {
    oldScrollY = $('html').css('overflow-y');
  }

  showModalDlg();
})

function prevImage() {
  var cur = $('.img-thumbnail-current');
  var prev = cur.parent().prev();
  if (prev.length) {
    prev = prev.children().first();
    prev.attr('class', 'img-thumbnail img-thumbnail-current');
    cur.attr('class', 'img-thumbnail');
    $('.slide_view_image').attr('src', prev.attr('src'));
    $('.slide_image_title').text(prev.attr('alt'));
  }
}

function nextImage() {
  var cur = $('.img-thumbnail-current');
  var next = cur.parent().next();
  if (next.length) {
    next = next.children().first();
    next.attr('class', 'img-thumbnail img-thumbnail-current');
    cur.attr('class', 'img-thumbnail');
    $('.slide_view_image').attr('src', next.attr('src'));
    $('.slide_image_title').text(next.attr('alt'));
  }
}

function onkeydown() {
  var keyCode = event.keyCode;
  if (37 == keyCode || 38 == keyCode) {
    prevImage();  // prev image
  } else if (39 == keyCode || 40 == keyCode){
    nextImage();  // next image
  }
}

function showModalDlg() {
  var dlg = $('#chrome_ext_slideview_images_modal_dlg');
  if (!dlg.length) {
    imgList = getImgList();
    if (!imgList.length) {
      return ;
    }

    insertSlideDomElement(imgList);

    dlg = $('#chrome_ext_slideview_images_modal_dlg');
  }
  dlg.modal();

  // mousewheel
  dlg.bind('mousewheel', function(event) {
    event.preventDefault();
    var e = window.event || event; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if (delta > 0) {
      prevImage();  // up
    } else {
      nextImage();  // down
    }
  });
  // keydown
  dlg.keydown(onkeydown);
  // show overflow-y
  dlg.on('hidden.bs.modal', function () {
    if (undefined == oldScrollY) {
      $('html').css('overflow-y', 'auto');
    } else {
      $('html').css('overflow-y', oldScrollY);
    }
  })

  // hidden overflow-y
  $('html').css('overflow-y', 'hidden');
}

String.prototype.trim=function(){
   return this.replace(/(^\s*)|(\s*$)/g, "");
}

// get all images in label a and img in the current page
function getImgList() {
  imgList = new Array();

  // find label a
  imgType = 'PNG|JPEG|GIF|BMP|TIFF|SVG|TAG|PICT|JPG';
  $('a').each(function() {
    var url = $(this).attr('href');
    if (!url) {
      return ;
    }
    // get url extension name
    var pos = url.lastIndexOf('.');
    if (-1 == pos) return ;
    ext_url = url.substr(pos+1).toUpperCase();
    if (-1 == imgType.indexOf(ext_url)) {
      return ;
    }

    // filter for erase dumplite images
    for (i = 0; i < imgList.length; ++i) {
      var imgUrl = imgList[i].url;
      if (imgUrl == url) {
        return ;
      }
    }

    // get image title
    var title = getTitle($(this));
    if (!title.length) {
      return ;
    }

    // ignore repeat images
    if (ignore_repeat) {
      for (i = 0; i < imgList.length; ++i) {
      var imgTitle = imgList[i].title;
        if (imgTitle == title) {
          return ;
        }
      }
    }

    // ignore thumbnail images
    if (!allow_thumbnail) {
      var upperUrl = url.toUpperCase();
      if (-1 != upperUrl.indexOf('THUMBNAIL')) {
        return ;
      }
/*      var image = new Image();
      image.src = url;
      if (image.width <= 128) {
        return ; // ignore icons
      }*/
    }

    // add object into array
    var item = new Object;
    item.title = title;
    item.url = url;
    imgList.push(item);
  })

  $('img').each(function() {
    var url = $(this).attr('src');
    // filter for erase dumplite images
    for (i = 0; i < imgList.length; ++i) {
      var imgUrl = imgList[i].url;
      if (imgUrl == url) {
        return ;
      }
    }

    // get image title
    var title = getTitle($(this));
    if (!title.length) {
      return ;
    }

    // ignore repeat images
    if (ignore_repeat) {
      for (i = 0; i < imgList.length; ++i) {
      var imgTitle = imgList[i].title;
        if (imgTitle == title) {
          return ;
        }
      }
    }

    // ignore thumbnail images
    if (!allow_thumbnail) {
      var upperUrl = url.toUpperCase();
      if (-1 != upperUrl.indexOf('THUMBNAIL')) {
        return ;
      }
      var image = new Image();
      image.src = url;
      if (image.width <= 128) {
        return ; // ignore icons
      }
    }

    // filter image size
    var image = new Image();
    image.src = url;
    if (image.width <= 64) {
      return ; // ignore icons
    }

    // add object into array
    var item = new Object;
    item.title = title;
    item.url = url;
    imgList.push(item);
  })

  return imgList;
}

function getTitle(obj) {
  if (!obj) {
    return '';
  }
  title = obj.text();
  title = title.trim();
  if (title.length) {
    return title;
  }
  title = obj.attr('title');
  if (title) {
    title = title.trim();
    if (title.length) {
      return title;
    }
  }
  title = obj.attr('alt');
  if (title) {
    title = title.trim();
    if (title.length) {
      return title;
    }
  }

  title = obj.attr('href');
  if (title) {
    title = title.trim();
    pos = title.lastIndexOf('/');
    if (-1 != pos) {
      title = title.substr(pos+1);
    }
    return title;
  }
  title = obj.attr('src');
  if (title) {
    title = title.trim();
    pos = title.lastIndexOf('/');
    if (-1 != pos) {
      title = title.substr(pos+1);
    }
    return title;
  }

  return '';
}

// insert slide image into HTML DOM
function insertSlideDomElement(imgList) {
  var initImage = imgList[0];
  var html = '<div class="modal fade" id="chrome_ext_slideview_images_modal_dlg" ';
  html += 'role="dialog" tabindex="-1" aria-hidden="true">';
  // slide_view
  html += '<div class="modal-body slide_view">';
  // slide_view/slide_navigation
  html += '<div class="slide_navigation">';
  html += '<span class="slide_nav_close">Close</span>';
  html += '</div>';
  // slide_view/slide_body
  html += '<div class="slide_body">';
  // slide_view/slide_body/slide_image
  html += '<div class="slide_image">';
  html += '<img class="slide_view_image" alt="' +
    initImage.title + '" src="' + initImage.url + '">';
  html += '<span class="slide_image_title">' +
    initImage.title + '</span>';
  html += '</div>';
  html += '</div>';
  // slide_view/slide_thumbnail
  html += '<div class="slide_thumbnail">';
  html += '<ul class="slide_ul">';
  for (i = 0; i < imgList.length; ++i) {
    html += '<li>';
    if (imgList[i].url == initImage.url) {
      html += '<img class="img-thumbnail img-thumbnail-current" ';
    } else {
      html += '<img class="img-thumbnail" ';
    }
    html += ' width="150" height="150" alt="' + imgList[i].title + '" src="'
      + imgList[i].url + '" title="' + imgList[i].title + '">';
    html += '</li>';
  }
  html += '</ul';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  $('body').prepend(html);

  $('.img-thumbnail').click(function() {
    var url = $(this).attr('src');
    var title = $(this).attr('alt');
    $('.slide_view_image').attr('src', url);
    $('.slide_image_title').text(title);

    $('.img-thumbnail').each(function() {
      $(this).attr('class', 'img-thumbnail');
    })
    $(this).attr('class', 'img-thumbnail img-thumbnail-current');
  })

  $('.slide_nav_close').click(function() {
    var dlg = $('#chrome_ext_slideview_images_modal_dlg');
    if (dlg.length) {
      dlg.modal('hide');
    }
  })
}