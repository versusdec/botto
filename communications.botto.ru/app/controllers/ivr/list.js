define(["microcore", "mst!/ivr/list"],
  function (mc, view) {

    return async function (params) {
      document.title = `${mc.i18n('ivr.title')} | Botto Platform`;

      return view({tab: params.tab});
    }
  }
);