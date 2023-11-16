define(["microcore", "app/modules/ivr/prepare", "mst!/layouts/view", "mst!/ivr/edit"],
  function (mc, ivr_prepare, page_view, view) {

      return async function (params) {
          document.title = `${mc.i18n('ivr.title')} | Botto Platform`;
          let ivr = {nodes: [], last_id: 0, project_id: mc.storage.get('project_id'), id: params.id}
          if (params.id !== 'new') {
              ivr = await mc.api.call('communications.ivr.get', {
                  id: params.id,
                  project_id: mc.storage.get('project_id')
              })
              if (!ivr) {
                  return mc.router.go(`/${mc.storage.get('project_id')}/404`)
              }
              if (params.mode === 'clone') {
                  ivr.mode = 'clone'
              }
          }

          mc.storage.set('ivr', ivr_prepare.toStorage(ivr))
          mc.events.off('ivr.created');
          return page_view({
              title: params.id === 'new' ? mc.i18n('ivr.create') : mc.i18n('ivr.edit'),
              back: `/${mc.storage.get('project_id')}/ivr/`,
              content: await view(ivr_prepare.toView(ivr))
          });
      }
  }
);