define(["microcore", "mst!/support/list/index"],
  function (mc, view) {

    return async function (params) {
      document.title = `${mc.i18n('support.title')} | Botto Platform`;

      return view({tab: params.tab});
    }
  }
);