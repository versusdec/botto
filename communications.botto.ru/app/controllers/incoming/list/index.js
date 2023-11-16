define(["microcore", "mst!/layouts/view", "mst!/incoming/list/index"],
  function (mc, view, content) {

      return async function (params) {
          document.title = `${mc.i18n('incoming.title')} | Botto Platform`;
          mc.storage.set('incoming.route', {
              tab: params.tab || 'active'
          })
          return view({
              title: mc.i18n(`incoming.title`),
              back: `/${mc.storage.get('project_id')}/`,
              tabs: [
                  {
                      title: mc.i18n(`mailings.tabs.available`),
                      active: !!!params.tab || params.tab === 'active',
                      link: `/${mc.storage.get('project_id')}/incoming/active/`
                  },
                  {
                      title: mc.i18n(`mailings.tabs.archived`),
                      active: params.tab === 'archived',
                      link: `/${mc.storage.get('project_id')}/incoming/archived/`
                  }
              ],
              content: await content({
                  tab: params.tab || 'active',
              })
          });
      }
  }
);