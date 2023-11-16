define(["microcore", "scripts",
      "mst!mailings/analytics/calls/item"],
  function (mc, scripts, item_view) {

      let project_id, scope, page, filter = {
          project_id: mc.storage.get('project_id'),
          direction: 'outbound'
      };

      mc.events.on('sys:page.init:controllers/mailings/analytics/handler', function () {

      });

      mc.events.on('calls.direction.change', (direction) => {
          filter.direction = direction;
          mc.storage.set('mailings.calls.direction', direction)
          mc.router.go(location.pathname)
      });

      mc.events.on('calls.flag.change', (select) => {
          if (select.value === 'all') {
              delete filter.flag
              delete filter.status
          } else {
              if (['lead', 'blacklisted', 'amd'].includes(select.value)) {
                  filter.flag = select.value;
                  delete filter.status
              } else {
                    filter.status = select.value;
                    delete filter.flag
              }
          }
          mc.storage.set('mailings.calls.flag', select.value)

          mc.router.go(location.pathname)
      });

      mc.events.on('mailings.analytics.calls.list', async () => {
          let response = await mc.api.call(`communications.mailings.details`, filter);
          if (response && response.items && response.items.length) {
              $(scope).find('tbody').html('');
              for (let i in response.items) {
                  let item = response.items[i];
                  if (item.record === false || item.record === 'false') {
                      item.record = false
                  } else {
                      item.file = `${require.config.api}${item.record}`;
                      item.record = true;
                  }
                  item.private_phone = scripts.phoneClassify(item.phone)
                  // item.type = type
                  $(scope).find('tbody').append(await item_view(item))
              }
              mc.events.push('system:pagination.update', {
                  total: response.total,
                  limit: filter.limit,
                  current: filter.offset / filter.limit + 1
              })
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
          mc.events.push('mailings.analytics.calls.list')
      }
  });