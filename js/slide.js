$(document).ready(function() {
  showModalDlg();
})

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
  // slide_view/slide_body/slide_navigation
  html += '<div class="slide_navigation">';
  html += '<span class="slide_nav_close">Close</span>';
  html += '</div>';
  // slide_view/slide_body
  html += '<div class="slide_body">';
  // slide_view/slide_body/slide_image
  html += '<div class="slide_image">';
  html += '<img class="slide_view_image" alt="' +
    initImage.title + '" src="' + initImage.url + '">';
  html += '</div>';
  html += '</div>';
  // slide_view/slide_thumbnail
  html += '<div class="slide_thumbnail">';
  html += '<ul class="slide_ul">';
  for (i = 0; i < imgList.length; ++i) {
    html += '<li>';
    html += '<img class="img-thumbnail" width="150" height="150" alt="' +
      imgList[i].title + '" src="' + imgList[i].url + '" title="' + imgList[i].title + '">';
    html += '</li>';
  }
  html += '</ul';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  $('body').prepend(html);

  $('.img-thumbnail').click(function() {
    var url = $(this).attr('src');
    $('.slide_view_image').attr('src', url);

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