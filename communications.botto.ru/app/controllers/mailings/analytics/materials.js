define(["microcore", "mst!mailings/analytics/materials", "mst!layouts/view"],
  function (mc, view, item_view, page_view) {

      return async function (params) {
          document.title = `${mc.i18n('mailings.analytics.title')} | Botto Platform`;

          const stats = await mc.api.call('communications.mailings.stats')

          return page_view({
              content: await view({
                  project_id: mc.storage.get('project_id'),
                  mailing_id: +params.id,
              }),
              tabs: [
                  {
                      title: mc.i18n('mailings.analytics.info.title'),
                      active: false,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/`
                  },
                  {
                      title: mc.i18n('mailings.analytics.calls.title'),
                      active: false,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/calls/`
                  },
                  {
                      title: mc.i18n('mailings.analytics.materials.title'),
                      active: true,
                      link: `/${mc.storage.get('project_id')}/mailings/stats/${params.type}/${params.id}/analytics/materials/`
                  }
              ],
              title: mc.i18n('mailings.analytics.title'),
              back: `/${mc.storage.get('project_id')}/mailings/`
          });
      }
  });