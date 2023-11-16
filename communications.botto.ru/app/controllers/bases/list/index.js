define(["microcore", "mst!/layouts/view", "mst!/bases/list/index"],
  function (mc, page_view, view) {


    return async function (params) {
      document.title = `${mc.i18n('bases.title')} | Botto Platform`;

      return page_view({
        title: mc.i18n(`${params.type}.title`),
        back: `/${mc.storage.get('project_id')}/`,
        tabs: [
          {
            title: mc.i18n(`${params.type}.tabs.available`),
            active: !!!params.tab,
            link: `/${mc.storage.get('project_id')}/database/${params.type}/`
          },
          {
            title: mc.i18n(`${params.type}.tabs.archived`),
            active: params.tab === 'archive',
            link: `/${mc.storage.get('project_id')}/database/${params.type}/archive/`
          }
        ],
        content: await view({
          tab: params.tab,
          type: params.type
        })
      })
    }
  });