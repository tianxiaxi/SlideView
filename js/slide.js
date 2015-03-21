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
  var curImage = $('.img-thumbnail-current');
  var curIndex = parseInt(curImage.attr('index'));
  var prevIndex = curIndex - 1;
  if (prevIndex < 0) {
    return ;
  }
  showImage(prevIndex);
}

function nextImage() {
  var curImage = $('.img-thumbnail-current');
  var curIndex = parseInt(curImage.attr('index'));
  var nextIndex = curIndex + 1;
  var maxIndex = 0;
  $('.img-thumbnail').each(function() {
    maxIndex += 1;
  })
  if (nextIndex >= maxIndex) {
    return ;
  }
  showImage(nextIndex);
}

function adjustCss() {
  var widthImage = $('.slide_thumbnail').offset().left;
  var heightImage = $(window).height() - 100;
  $('.slide_image').height(heightImage);
  $('.slide_image').width(widthImage);
}

function showImage(index) {
  $('.slide_thumbnail').scrollTop(0);
  var countImage = 0;
  $('.img-thumbnail').each(function() {
    countImage += 1;
    $(this).removeClass('img-thumbnail-current');
    var curIndex = $(this).attr('index');
    if (index == curIndex) {
      $(this).addClass('img-thumbnail-current');

      var url = $(this).attr('src');
      var title = $(this).attr('alt');
      $('.slide_view_image').attr('src', url);
      $('.slide_image_title a').text(title);
      $('.slide_image_title a').attr('href', url);
    }
  })

  var tips = (parseInt(index) + 1) + '/' + countImage;
  $('.slide_count_tips').text(tips);
  adjustCss();

  var offset = $('.img-thumbnail-current').position().top - 80;
  $('.slide_thumbnail').scrollTop(offset);
}

function showModalDlg() {
  $('#chrome_ext_slideview_images_modal_dlg').remove();
  imgList = getImgList();
  if (!imgList.length) {
    return ;
  }
  insertSlideDomElement(imgList);
  var dlg = $('#chrome_ext_slideview_images_modal_dlg');
  dlg.modal('show');


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
  dlg.keydown(function() {
    var keyCode = event.keyCode;
    if (37 == keyCode || 38 == keyCode) {
      prevImage();  // prev image
    } else if (39 == keyCode || 40 == keyCode){
      nextImage();  // next image
    }
//    console.log('keyboard: ' + keyCode);
  });

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
  var imgList = new Array();
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
      baseName = getFileName(url);
      for (i = 0; i < imgList.length; ++i) {
      var imgTitle = imgList[i].baseName;
        if (imgTitle == baseName) {
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
    item.baseName = getFileName(url);
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
      baseName = getFileName(url);
      for (i = 0; i < imgList.length; ++i) {
      var imgTitle = imgList[i].baseName;
        if (imgTitle == baseName) {
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
    item.baseName = getFileName(url);
    imgList.push(item);
  })

  return imgList;
}

function getFileName(url) {
  var baseName = url;
  var pos = url.lastIndexOf('/');
  if (-1 != pos) {
    baseName = url.substr(pos+1);
  }
  return baseName;
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
  html += 'role="dialog" tabindex="1" aria-hidden="true">';
  // slide_view
  html += '<div class="modal-dialog slide_view">';
  // slide_view/slide_navigation
  html += '<div class="slide_navigation">';
//  html += '<span class="slide_nav_close">Close</span>';
  html += '<button type="button" class="close" data-dismiss="modal" ' +
    'aria-label="Close"><span aria-hidden="true">×</span></button>';
  html += '</div>';
  // slide_view/slide_thumbnail
  html += '<div class="slide_thumbnail">';
  html += '<ul class="slide_ul">';
  var curIndex = 0;
  for (i = 0; i < imgList.length; ++i) {
    html += '<li>';
    if (imgList[i].url == initImage.url) {
      html += '<img class="img-thumbnail img-thumbnail-current" ';
      curIndex = i;
    } else {
      html += '<img class="img-thumbnail" ';
    }
    html += ' width="150" height="150" alt="' + imgList[i].title + '" src="'
      + imgList[i].url + '" index="' + i + '">';
    html += '</li>';
  }
  html += '</ul>';
  html += '</div>';
  // slide_view/slide_body
  html += '<div class="slide_body">';
  html += '<div class="slide_count_tips">';
  html += '<span>' + (parseInt(curIndex)+1) + '/' + imgList.length + '</span>';
  html += '</div>';
  html += '<div class="slide_image">';
  html += '<img class="slide_view_image" alt="' +
    initImage.title + '" src="' + initImage.url + '">';
  html += '<div class="slide_image_title">';
  html += '<a target="_blank" href="' + initImage.url + '">' + initImage.title + '</a>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  $('body').prepend(html);

  $('.img-thumbnail').click(function() {
    var index = $(this).attr('index');
    showImage(index);
  })

  $('.slide_nav_close').click(function() {
    var dlg = $('#chrome_ext_slideview_images_modal_dlg');
    if (dlg.length) {
      dlg.modal('hide');
    }
  })
}