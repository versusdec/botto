define(['microcore', 'mst!pixel/list/item', "notify", "scripts"],
  function (mc, item_view, notify) {
      let page, scope, filter = {};

      mc.events.on('pixel.list', async () => {
          let response = await mc.api.call('communications.pixel.list', {
              project_id: mc.storage.get('project_id'),
              ...filter
          });
          response = {
              limit: 10,
              total: 1,
              items: [{
                  name: 'domain.ru',
                  status: 'active',
                  visitors: 3434,
                  def: 343,
                  conversion: 10,
                  cost: 2744,
                  id: 1
              }]
          }
          if (response && response.items && response.items.length) {
              $(scope).find('tbody').html('');

              for (let i in response.items) {
                  let item = response.items[i];
                  $(scope).find('tbody').append(await item_view(item))
              }
              mc.events.push('system:pagination.update', {
                  id: 'pixel',
                  total: response.total,
                  limit: response.limit,
                  current: filter.offset / filter.limit + 1
              })
          } else {
              if ($(scope).find('.loader').length)
                  $(scope).find('.loader').html(mc.i18n('table.empty'))
              else
                  $(scope).find('tbody').html(`<tr><td colspan="7"><div class="loader">${mc.i18n('table.empty')}</div></td></tr>`);
          }
      })

      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter = {
              project_id: mc.storage.get('project_id'),
              limit: +hash_params.limit || 10,
              offset: (page - 1) * (+hash_params.limit || 10),
              ...hash_params
          }
          delete filter.page

          scope = $scope;
          mc.events.push('pixel.list')
      }
  });