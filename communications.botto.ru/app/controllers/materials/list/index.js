define(["microcore", "mst!/materials/list/index"],
  function (mc, view) {


      return async function (params) {
          document.title = `${mc.i18n('materials.title')} | Botto Platform`;
          mc.storage.set('materials.route', {
              tab: params.tab || 'active',
              type: params.type || 'audio'
          })
          return view({
              tab: params.tab || 'active',
              type: params.type || 'audio'
          });
      }
  }
);