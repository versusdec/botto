define(["microcore", "mst!/layouts/view",
      "mst!/materials/edit/audio/index",
      "mst!/materials/edit/tts/index",
      "mst!/materials/edit/text/index",
      "mst!/materials/edit/link/index",
      "notify", "scripts", "app/modules/materials"],
  function (mc, view,
            audio_view,
            tts_view,
            text_view,
            link_view,
            notify,
            scripts,
            materials_data) {

      let material;

      mc.events.on('sys:page.init:materials/edit/index', () => {
          $('[name=tts_template-voice]').on('change', () => {
              material.data.data = {text: $('[name=tts_template-text]')[0].value, voice: $('[name=tts_template-voice]:checked')[0].value};
          })
      })

      return async function (params) {
          document.title = `${mc.i18n('materials.title')} | Botto Platform`;

          let history = mc.storage.get('materials.route') || {
              tab: 'active', type: 'audio'
          };

          let data = await materials_data(params);

          let edit_view;

          material = mc.storage.get('material')
          if (params.type === 'audio') {
              edit_view = await audio_view(data)
          } else if (params.type === 'text') {
              edit_view = await text_view(data)
          } else if (params.type === 'tts') {
              edit_view = await tts_view(data)
          } else if (params.type === 'link') {
              if (params.id === 'new') {
                  data.material = {redirect_type: 'js'}
              }
              edit_view = await link_view(data)
          } else {
              mc.router.go(`/${mc.storage.get('project_id')}/materials/`)
          }
          mc.events.off('materials.created');

          return view({
              title: params.id === 'new' ? mc.i18n('materials.create') : mc.i18n('materials.edit.edit'),
              back: `/${mc.storage.get('project_id')}/materials/${history.tab}/${history.type}/`,
              content: edit_view
          });
      }
  });