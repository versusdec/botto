define(["microcore", "mst!/contacts/list/index"],
  function (mc, view) {

    return async function (params) {
      document.title = `${mc.i18n('contacts.title')} | Botto Platform`;

      return view();
    }
  }
);