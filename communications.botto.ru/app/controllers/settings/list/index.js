define(["microcore", "mst!/settings/list/index"],
  function (mc, view) {


    return async function (params) {
      document.title = `${mc.i18n('settings.title')} | Botto Platform`;
      mc.storage.set('settings.route', {
        tab: params.tab || 'active',
        type: params.type || 'fields'
      })
      return view({
        tab: params.tab || 'active',
        type: params.type || 'fields'
      });
    }
  }
);