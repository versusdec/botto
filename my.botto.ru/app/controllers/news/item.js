define(["microcore", "mst!/news/item/index", "mst!/news/item/item",], function (mc, view, news_view) {

  let id;

  mc.events.on('sys:page.init:news/item', () => {
    mc.api.call('news.get', {id: id}).then(async res => {
      if (res) {
        $('#news-holder').html('').append(await news_view(res))
      } else {
        $('.loader').html(mc.i18n('news.error'))
      }
    });

  });

  return async function (params) {
    document.title = `${mc.i18n('news.title')} | Botto Platform`;
    id = +params.id;
    return view();
  }
});