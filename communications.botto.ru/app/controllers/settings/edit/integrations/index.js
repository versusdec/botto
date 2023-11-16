define([
      'microcore',
      'mst!layouts/view',
      'mst!settings/edit/integrations/create',
      'mst!settings/edit/integrations/edit',
      "scripts",
      "app/modules/integrations",
      "notify",
  ],
  function (mc, page_view, create_view, edit_view, scripts, prepare_data, notify) {

      return async (params) => {
          let data = {...await prepare_data(params.id), copy: params.mode === 'clone', block: true}
          let content = +params.id && data.integration.type !== 'api' ? await edit_view(data) : await create_view(data)

          let page_data = {
              title: mc.i18n('settings.integrations.title'),
              back: `/${mc.storage.get('project_id')}/settings/active/integrations/`,
              content: content
          }

          if (+params.id && data.integration.type !== 'api') {
              page_data.tabs = [
                  {
                      title: mc.i18n('edit.common'),
                      active: true,
                      link: `#tab=common`
                  },
                  {
                      title: mc.i18n('settings.title'),
                      active: false,
                      link: `#tab=settings`
                  },
                  {
                      title: mc.i18n('settings.fields.match.title'),
                      active: false,
                      link: `#tab=fields`
                  }
              ]
          }

          return page_view(page_data)
      }
  });