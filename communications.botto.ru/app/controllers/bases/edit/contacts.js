define(['microcore', "mst!/bases/edit/item", "notify", "confirm"],
  function (mc, item_view, notify, confirm, popup) {

      let filter = {}, page, type;

      mc.events.on('bases.contact.exclude', ({value, btn}) => {
          confirm(mc.i18n('contacts.exclude.confirm'), '', () => {
              mc.api.call(`communications.${type}.contacts.exclude`, {
                  project_id: filter.project_id,
                  id: filter.id,
                  contacts: value.toString()}).then(res => {
                  if (res) {
                      notify(mc.i18n('contacts.exclude.excluded'))
                      $(btn).closest('tr').remove()
                  } else {
                      notify(mc.i18n('system.error'))
                  }
              })
          })
      });

      return async ($scope, $params) => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          filter.id = +$params.id;
          filter.project_id = mc.storage.get('project_id');
          type = $params.type;
          if (filter.id) {
              let contacts = await mc.api.call(`communications.${type}.contacts.list`, filter)
              if (contacts && contacts.items && contacts.items.length) {
                  $($scope).find('tbody').html('');
                  for (let i in contacts.items) {
                      let item = contacts.items[i];
                      $($scope).find('tbody').append(await item_view(item))
                  }
                  mc.events.push('system:pagination.update', {
                      total: contacts.total,
                      limit: contacts.limit,
                      current: filter.offset / filter.limit + 1
                  })
              } else {
                  $($scope).find('.loader').html(mc.i18n('table.empty'))
              }
          }
      }
  });