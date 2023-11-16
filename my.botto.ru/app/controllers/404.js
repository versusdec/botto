define(["microcore", "mst!/404"], function (mc, view) {


    return async function (params) {
      document.title = `${mc.i18n('system.e404.not_found')} | Botto Platform`;

      return view();
    }
  });