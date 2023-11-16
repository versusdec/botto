define(
    ["microcore", "mst!/news/list/index"],
    function (mc, view
) {
    return function (params) {
        document.title = `${mc.i18n('news.title')} | Botto Platform`;

        return view();
    }
});