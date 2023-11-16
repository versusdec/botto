define(["microcore", "mst!mailings/analytics/calls",
      "mst!mailings/analytics/calls/item", "mst!layouts/view"],
  function (mc, view, item_view, page_view) {

      return async function (params) {
          document.title = `${mc.i18n('mailings.analytics.title')} | Botto Platform`;

          return page_view({
              content: await view({
                  project_id: mc.storage.get('project_id'),
                  mailing_id: +params.id,
                  flag: mc.storage.get('mailings.calls.flag') || 'all',
                  direction: mc.storage.get('mailings.calls.direction') || 'outbound'
              }),
              tabs: [
                  {
                      title: mc.i18n('mailings.analytics.info.title'),
                      active: false,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/`
                  },
                  {
                      title: mc.i18n('mailings.analytics.calls.title'),
                      active: true,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/calls/`
                  }
              ],
              title: mc.i18n('mailings.analytics.title'),
              back: `/${mc.storage.get('project_id')}/mailings/`
          });
      }
  });