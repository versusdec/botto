define(["microcore", "scripts",
      "mst!mailings/analytics/materials/item"
  ],
  function (mc, scripts, item_view) {

      let project_id, scope, page, filter = {
          project_id: mc.storage.get('project_id'),
      };

      mc.events.on('mailings.analytics.materials.list', async () => {
          const stats = await mc.api.call('communications.mailings.stats', {
              project_id: mc.storage.get('project_id'),
              id: filter.id,
          }).then(res=>{
              return res && res.materials && res.materials.map((item)=>{
                  return {
                      ...item,
                      file: `${require.config.api}${item.data.data.path}`
                  }
              });

          })
          if (stats) {
              $(scope).find('tbody').html('');
              for (let i in stats) {
                  let item = stats[i];
                  $(scope).find('tbody').append(await item_view(item))
              }
              /*mc.events.push('system:pagination.update', {
                  total: response.total,
                  limit: response.limit,
                  current: filter.offset / filter.limit + 1
              })*/
          } else {
              $(scope).find('.loader').html(mc.i18n('table.empty'))
          }
      })

      return async function ($scope, $params) {
          project_id = mc.storage.get('project_id');
          filter.id = +$params.id;
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;

          scope = $scope;
          mc.events.push('mailings.analytics.materials.list')
      }
  });