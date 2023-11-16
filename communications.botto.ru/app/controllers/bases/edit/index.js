define(["microcore", "mst!/layouts/view", "mst!/bases/edit/index", 'app/modules/export',],
  function (mc, page_view, edit_view) {

      return async function (params) {
          document.title = `${mc.i18n(`${params.type}.title`)} | Botto Platform`;

          if (+params.id) {
              mc.storage.set('base', await mc.api.call(`communications.${params.type}.get`, {
                  project_id: mc.storage.get('project_id'), id: +params.id
              }).then(res => {
                  if (res) {
                      return res
                  } else {
                      mc.router.go(`/${mc.storage.get('project_id')}/404`)
                  }
              }))
          } else {
              mc.storage.set('base', {
                  name: '',
                  project_id: mc.storage.get('project_id')
              })
          }
          mc.events.off('bases.created')

          return page_view({
              title: params.id === 'new' ? mc.i18n(`${params.type}.create`) : mc.i18n(`${params.type}.edit`),
              back: `/${mc.storage.get('project_id')}/database/${params.type}/`,
              content: await edit_view({
                  id: params.id,
                  base: mc.storage.get('base'),
                  type: params.type
              })
          });
      }
  });