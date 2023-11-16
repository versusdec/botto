define(['microcore', 'mst!incoming/list/item', "confirm", "notify"],
  function (mc, item_view, confirm, notify) {

      let filter = {
          project_id: mc.storage.get('project_id')
      }, page, scope, params;

      mc.events.on('ws:communications.incoming.update', async (data) => {
          console.log(data);
      })

      mc.events.on('incoming.archive', (id) => {
          confirm(mc.i18n('incoming.confirm_archive'), '', () => {
              mc.api.call('communications.incoming.update', {
                  id: +id,
                  project_id: mc.storage.get('project_id'),
                  status: 'archived'
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n('incoming.archived'));
                        mc.router.go(location.pathname)
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('incoming.unzip', (id) => {
          confirm(mc.i18n('incoming.confirm_unzip'), '', () => {
              mc.api.call('communications.incoming.update', {
                  id: +id,
                  project_id: mc.storage.get('project_id'),
                  status: 'active'
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n('incoming.unzipped'));
                        mc.router.go(location.pathname)
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('incoming.list', async () => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.status = params.tab;
          filter.limit = parseInt(hash_params.limit) || 50;
          filter.offset = (page - 1) * filter.limit;
          if (params.tab === 'archived') {
              filter.limit = parseInt(hash_params.limit) || 10;
          }

          let response = await mc.api.call(`communications.incoming.list`, filter);
          response = {
              total: 1,
              limit: 10,
              items: [{
                  id: 1,
                  name: "Not actual item",
                  status: "active",
                  stats: {
                      spent: 1000,
                      ppl: 1.1263456749875642312645646,
                      leads: 7
                  }
              }]
          }
          if (response && response.items && response.items.length) {
              mc.storage.set('incoming_list', response.items)
              $(scope).find('tbody').html('');
              let items = response.items;
              for (let i in items) {
                  let item = items[i];

                  item.stats.ppl = item.stats.ppl.toFixed(2)
                  $(scope).find('tbody').append(`<tr data-id="${item.id}">${await item_view(item)}</tr>`)
              }

              mc.events.push('system:pagination.update', {
                  id: 'mailings',
                  total: response.total,
                  limit: response.limit,
                  current: filter.offset / filter.limit + 1
              })

          } else {
              $(scope).find('.loader').html(mc.i18n('table.empty'))
          }

      })

      return async ($scope, $params) => {
          scope = $scope;
          params = $params;
          mc.events.push('incoming.list')

      }
  });