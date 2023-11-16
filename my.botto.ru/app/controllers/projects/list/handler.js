define(['microcore', 'mst!projects/list/my/item', 'mst!projects/list/archived/item', "/app/modules/confirm", "/app/modules/notify"],
  function (mc, my_item_view, archived_item_view, confirm, notify) {
      let filter = {}, page;

      mc.events.on('projects.archive', (id) => {
          confirm(mc.i18n('projects.confirm_archive'), '', () => {
              mc.api.call('projects.archive', {id: parseInt(id)})
                .then(res => {
                    if (res) {
                        notify(mc.i18n('projects.archived'));
                        mc.router.go(location.pathname)
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      return async ($scope, $params) => {
          let hash_params = mc.router.hash(), isArchive = false;
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          filter.status = 'active';
          let method = $params.tab.length && $params.tab === 'shared' ? $params.tab : 'my';
          if ($params.tab.length && $params.tab === 'archived') {
              filter.status = 'archived';
              isArchive = true
          }
          let projects = await mc.api.call(`projects.${method}`, filter);

          if (projects && projects.items && projects.items.length) {
              $($scope).find('tbody').html('');
              for (let i in projects.items) {

                  let item = projects.items[i];

                  if (item.applications && item.applications.length) {
                      let apps = [];
                      for (let i in item.applications) {
                          apps.push({name: item.applications[i]})
                      }
                      item.applications = apps
                  }
                  if (method === 'shared')
                      item.shared = true;

                  if (!isArchive)
                      $($scope).find('tbody').append(await my_item_view(item))
                  else
                      $($scope).find('tbody').append(await archived_item_view(item))
              }
              mc.events.push('support:stats.update', {
                  total: projects.total
              });
              mc.events.push('system:pagination.update', {
                  id: 'projects',
                  total: projects.total,
                  limit: projects.limit,
                  current: filter.offset / filter.limit + 1
              })
              mc.events.push('routeChange')

          } else {
              $($scope).find('.loader').html(mc.i18n('table.empty'))
          }


      }
  });