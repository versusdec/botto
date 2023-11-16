define(["microcore", "mst!/phones/rent/index"],
  function (mc, view) {

    return async function (params) {
      document.title = `${mc.i18n('phones.my')} | Botto Platform`;

      return view();
    }
  });