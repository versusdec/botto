define(["microcore", "mst!mailings/analytics/materials/index", "mst!layouts/view"],
  function (mc, view, page_view) {

      return async function (params) {
          document.title = `${mc.i18n('mailings.analytics.title')} | Botto Platform`;
          let mailing = await mc.api.call('communications.mailings.get',
            {project_id: mc.storage.get('project_id'), id: +params.id})
          return page_view({
              content: await view({
                mailing_id: params.id
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
              title: mc.i18n('mailings.analytics.title') + ` - ${mailing.name}`,
              back: `/${mc.storage.get('project_id')}/mailings/`
          });
      }
  });