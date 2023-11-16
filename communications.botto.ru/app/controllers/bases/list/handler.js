define(['microcore',
      'mst!bases/list/item',
      "confirm",
      "notify",
      'app/modules/export',
  ],
  function (mc, item_view, confirm, notify) {

      let type;

      mc.events.on('ws:communications.bases.update', async (data) => {
          let table = $('#base-list');
          if (data.status !== 'pending') {
              mc.storage.get(`${type}_list`).find(x => {
                  if (x.id === data.id && x.status === 'pending') {
                      x.status = data.status
                      notify(`${mc.i18n('bases.base')} ${data.name} ${mc.i18n('bases.processed')}`)
                  }
              })
          }
          if (data.status === 'pending') {
              mc.storage.get(`${type}_list`).find(x => {
                  if (x.id === data.id && x.status !== 'pending') {
                      x.status = data.status
                      notify(`${mc.i18n('bases.base')} ${data.name} ${mc.i18n('bases.pending')}`)
                  }
              })
          }

          if (table && table.find(`[data-id="${data.id}"]`).length) {
              let row = table.find(`[data-id="${data.id}"]`);
              data.size = {
                  total: data.total
              }
              $(row).html(await item_view(data))
          }
      })

      mc.events.on('ws:communications.blacklist.update', (data) => {
          console.log(data);
      })

      let filter = {
          project_id: mc.storage.get('project_id'),
          status: 'active'
      }, page;

      mc.events.on('bases.archive', ({id, btn}) => {
          confirm(mc.i18n(`${type}.archive`), '', () => {
              mc.api.call(`communications.${type}.update`, {
                  id: +id,
                  project_id: mc.storage.get('project_id'),
                  status: 'archived'
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n(`${type}.archived`));
                        $(btn).closest('tr').remove()
                    } else {
                        notify(mc.i18n('system.error'))
                    }
                })
          })
      });

      mc.events.on('bases.unzip', ({id, btn}) => {
          confirm(mc.i18n(`${type}.unzip`), '', () => {
              mc.api.call(`communications.${type}.update`, {
                  id: +id,
                  project_id: mc.storage.get('project_id'),
                  status: 'active'
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n(`${type}.unzipped`));
                        $(btn).closest('tr').remove()
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('bases.list', async (scope) => {
          let response = await mc.api.call(`communications.${type}.list`, filter);

          if (response && response.items && response.items.length) {
              mc.storage.set(`${type}_list`, response.items);

              $(scope).find('tbody').html('');
              for (let i in response.items) {
                  let item = response.items[i];
                  item.type = type
                  $(scope).find('tbody').append(`<tr data-id="${item.id}">${await item_view(item)}</tr>`)
              }
              mc.events.push('system:pagination.update', {
                  total: response.total,
                  limit: response.limit,
                  current: filter.offset / filter.limit + 1
              })
          } else {
              $(scope).find('.loader').html(mc.i18n('table.empty'))
          }
      })

      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          filter.status = 'active';
          type = $params.type;
          if ($params.tab.length) {
              filter.status = 'archived'
          }

          mc.events.push('bases.list', $scope)
      }
  });