define(["microcore", "mst!/projects/list/index"],
  function (mc, view) {

    return async function (params) {
      document.title = `${mc.i18n('projects.title')} | Botto Platform`;

      return view({tab: params.tab, title: mc.i18n('projects.tabs.my')});
    }
  }
);