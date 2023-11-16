define(["microcore", "mst!/layouts/view", "mst!/mailings/list/index", "css!/css/mailings"],
  function (mc, view, content) {

      return async function (params) {
          document.title = `${mc.i18n('mailings.title')} | Botto Platform`;
          mc.storage.set('mailings.route', {
              tab: params.tab || 'active',
              type: params.type || 'voice'
          })
          let filter = mc.storage.get('mailings.filter');
          /*if(!filter || !filter?.state)
              filter.state = ['running', 'paused', 'ended', 'stopped']*/
          return view({
              title: mc.i18n(`mailings.title`),
              back: `/${mc.storage.get('project_id')}/`,
              tabs: [
                  {
                      title: mc.i18n(`mailings.tabs.available`),
                      active: !!!params.tab || params.tab === 'active',
                      link: `/${mc.storage.get('project_id')}/mailings/active/${params.type || 'voice'}/`
                  },
                  /*{
                      title: mc.i18n(`mailings.tabs.ended`),
                      active: params.tab === 'ended',
                      link: `/${mc.storage.get('project_id')}/mailings/ended/${params.type || 'voice'}/`
                  },*/
                  {
                      title: mc.i18n(`mailings.tabs.archived`),
                      active: params.tab === 'archived',
                      link: `/${mc.storage.get('project_id')}/mailings/archived/${params.type || 'voice'}/`
                  }
              ],
              content: await content({
                  tab: params.tab || 'active',
                  type: params.type || 'voice',
                  filter: filter
              })
          });
      }
  }
);