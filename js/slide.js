var imgList = JSON.parse("[]");

function getImageList() {
  $('a').each(function() {
    var title = $(this).text();
    if (!title) {
      title = $(this).attr('title');
    }
    if (!title) {
      return ;
    }
    var url = $(this).attr('url');
    console.log(url);
    var Image = new Object;
    Image.title = title;
    Image.url = url;
    imgList.push(Image);
  });
  return imgList;
}