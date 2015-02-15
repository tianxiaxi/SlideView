var oldKeyDown = document.onkeydown;
$(document).ready(function() {
  showModalDlg();
  oldKeyDown = document.onkeydown;
  document.onkeydown = onkeydown;
})

function onkeydown() {
  if ($('#chrome_ext_slideview_images_modal_dlg').is(":hidden")) {
    document.onkeydown = oldKeyDown;
    return ;
  }
  var keyCode = event.keyCode;
  if (37 == keyCode || 38 == keyCode) {
    // prev image
    var cur = $('.img-thumbnail-current');
    var prev = cur.parent().prev();
    if (prev.length) {
      prev = prev.children().first();
      prev.attr('class', 'img-thumbnail img-thumbnail-current');
      cur.attr('class', 'img-thumbnail');
      $('.slide_view_image').attr('src', prev.attr('src'));
      $('.slide_image_title').text(prev.attr('alt'));
    }
  } else if (39 == keyCode || 40 == keyCode){
    // next image
    var cur = $('.img-thumbnail-current');
    var next = cur.parent().next();
    if (next.length) {
      next = next.children().first();
      next.attr('class', 'img-thumbnail img-thumbnail-current');
      cur.attr('class', 'img-thumbnail');
      $('.slide_view_image').attr('src', next.attr('src'));
      $('.slide_image_title').text(next.attr('alt'));
    }
  } else if (27 == keyCode) {
    // exit
    var dlg = $('#chrome_ext_slideview_images_modal_dlg');
    if (dlg.length) {
      dlg.modal('hide');
    }
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