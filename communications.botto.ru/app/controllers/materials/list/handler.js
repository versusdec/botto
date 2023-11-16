define(['microcore', 'mst!materials/list/item',
      'mst!materials/editpopup',
      "confirm", "notify", "scripts"],
  function (mc, item_view, create_popup, confirm, notify, scripts) {
      let filter = {
            project_id: mc.storage.get('project_id'),
            status: 'active',
            type: 'audio'
        }, page,
        method = 'communications.materials.list',
        link = false;

      mc.events.on('materials.archive', ({btn, id}) => {
          confirm(mc.i18n('materials.confirm_archive'), '', () => {
              let method = 'communications.materials.update'
              if (link) {
                  method = 'communications.tracker.update'
              }
              mc.api.call(method, {
                  id: +id,
                  project_id: filter.project_id,
                  status: 'archived'
              }).then(res => {
                  if (res) {
                      notify(mc.i18n('materials.archived'));
                      $(btn).closest('tr').remove()
                  } else
                      notify(mc.i18n('system.error'))
              })
          })
      });

      mc.events.on('materials.unzip', ({btn, id}) => {
          confirm(mc.i18n('materials.confirm_unzip'), '', () => {
              let method = 'communications.materials.update'
              if (link)
                  method = 'communications.tracker.update'
              mc.api.call(method, {
                  id: +id,
                  project_id: filter.project_id,
                  status: 'active'
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n('materials.unzipped'));
                        $(btn).closest('tr').remove()
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('materials.list', async (scope) => {
          let response = await mc.api.call(method, filter);
          link ? $('[data-visible]').addClass('hide') : $('[data-visible]').removeClass('hide')
          if (response && response.items && response.items.length) {
              $(scope).find('tbody').html('');
              for (let i in response.items) {
                  let item = response.items[i];
                  item.route = item.type
                  if (item.type === 'short_message_template') {
                      item.route = 'text';
                  }
                  if (item.type === 'tts_template') {
                      item.route = 'tts';
                  }
                  if (item.type === 'audio') {
                     if(item.data.data && item.data.data.path) {
                         item.file = `${require.config.api}${item.data.data.path}`;
                     } else {
                         item.file = true
                     }
                  }
                  if (item.url) {
                      item.route = 'link';
                  }
                  $(scope).find('tbody').append(await item_view(item))
              }
              $(scope).find('tbody .message_text').on('click', function(){
                  // $(this).toggleClass('hid')
              })
              mc.events.push('system:pagination.update', {
                  id: 'materials',
                  total: response.total,
                  limit: response.limit,
                  current: filter.offset / filter.limit + 1
              })

          } else {
              $(scope).find('.loader').html(mc.i18n('table.empty'))
          }
      })

      /*mc.events.on('materials.create.type', () => {
        popup(create_popup, {})
      })*/

      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          filter.status = 'active';

          if ($params.type === 'text')
              filter.type = 'short_message_template';
          else if( $params.type === 'audio') {
              filter.type = 'audio';
          } else if($params.type === 'tts'){
              filter.type = 'tts_template'
          }
          if ($params.type === 'link') {
              method = 'communications.tracker.list';
              link = true;
              delete filter.type
          } else {
              link = false;
              method = 'communications.materials.list';
          }
          if ($params.tab === 'archive') {
              filter.status = 'archived'
          }
          mc.events.push('materials.list', $scope)
      }
  });