define(['microcore', 'mst!settings/edit/tags', "confirm", "notify"],
  function (mc, item_view, confirm, notify) {

      let filter = {
          project_id: mc.storage.get('project_id'),
          status: 'active',
          limit: 100
      }

      mc.events.on("settings.tags.create", async (button) => {
          if (!$('#tags [name=tag]').val().length) {
              return mc.fieldError($('#tags').find('[name=tag]'))
          } else {
              mc.api.call('projects.tags.create', {
                  project_id: mc.storage.get('project_id'),
                  tag: $(button).closest('#tags').find('[name=tag]').val()
              })
                .then(async res => {
                    if (res) {
                        // $('#tags #list').append(await item_view({id: res, tag: $('#tags [name=tag]').val()}))
                        mc.events.push('settings.tags.list');
                        notify(mc.i18n('settings.created'));
                        $('#tags [name=tag]').val('')
                    }
                })
          }
      });

      mc.events.on("settings.tags.remove", async ({id, btn}) => {
          confirm(mc.i18n('settings.tags.confirm'), '', () => {
              if (+id) {
                  mc.api.call('projects.tags.update', {project_id: filter.project_id, id: +id, status:'archived'})
                    .then(res => {
                        if (res) {
                            $(btn).closest('.tag').remove();
                            notify(mc.i18n('settings.deleted'))
                        } else {
                            notify(mc.i18n('system.error'))
                        }
                    })
              } else {

              }
          })
      });

      mc.events.on('settings.tags.list', async () => {
          let tags = await mc.api.call("projects.tags.list", filter);

          if (tags && tags.items && tags.items.length) {
              $('#tags #list').html('')
              for (let i in tags.items) {
                  let item = tags.items[i]
                  $('#tags #list').append(await item_view(item))
              }
          } else {
              // console.log('hey')
              $('#tags #list .loader').html(mc.i18n('table.empty'))
          }
      });

      return async ($scope, $params) => {
          mc.events.push('settings.tags.list');

          if ($params.tab === 'archived') {
              filter.status = $params.tab
          } else {
              filter.status = 'active'
          }
      }
  });