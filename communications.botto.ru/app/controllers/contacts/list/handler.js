define(['microcore', 'mst!contacts/list/item', "confirm", "notify"],
  function (mc, item_view, confirm, notify) {
    const cpid = mc.storage.get('project_id');
    let filter = {
      project_id: cpid
    }, page, scope;

    mc.events.on('contacts.list', async () => {
      let response = await mc.api.call(`communications.contacts.list`, filter);

      if (response && response.items && response.items.length) {
        $(scope).find('tbody').html('');
        for (let i in response.items) {

          let item = response.items[i];

          $(scope).find('tbody').append(await item_view(item))
        }

        mc.events.push('system:pagination.update', {
          id: 'contacts',
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

      scope = $scope;
      mc.events.push('contacts.list')
    }
  });