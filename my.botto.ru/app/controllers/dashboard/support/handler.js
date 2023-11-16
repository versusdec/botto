define(['microcore', 'mst!dashboard/support/item', 'app/modules/confirm', 'app/modules/notify',], function (mc, item_view, confirm, notify) {

  let scope;

  mc.events.on('dashboard.ticket.archive', (id) => {
    confirm(mc.i18n('support.actions.archive'), '', () => {
      mc.api.call('support.archive', {id: parseInt(id)})
        .then(res => {
          if (res) {
            notify(mc.i18n('support.actions.archived'));
            mc.events.push('dashboard.support.list')
          }
          else
            notify(mc.i18n('system.error'))
        })
    })
  });

  mc.events.on('dashboard.ticket.close', (id) => {
    confirm(mc.i18n('support.actions.close'), '', () => {
      mc.api.call('support.close', {id: parseInt(id)})
        .then(res => {
          if (res) {
            notify(mc.i18n('support.actions.closed'));
            mc.events.push('dashboard.support.list')
          }
          else
            notify(mc.i18n('system.error'))
        })
    })
  });
/*
  mc.events.on('dashboard.ticket.reopen', (id) => {
    confirm(mc.i18n('support.actions.reopen'), '', () => {
      mc.api.call('support.reopen', {id: parseInt(id)})
        .then(res => {
          if (res) {
            notify(mc.i18n('support.actions.opened'));
          }
          else
            notify(mc.i18n('system.error'))
        })
    })
  });*/

  mc.events.on('dashboard.support.list', async () => {
    let tickets = await mc.api.call("support.list", {
      limit: 3,
      status: 'active'
    });

    if (tickets && tickets.items && tickets.items.length) {
      $(scope).find('table > tbody').html('');
      for (let i in tickets.items) {
        let item = tickets.items[i];

        $(scope).find('table > tbody').append(await item_view(item))
      }
    } else {
      $(scope).find('table > tbody .loader').text(mc.i18n('table.empty'))
    }
  })

  return async ($scope, $params) => {
    scope = $scope
    mc.events.push('dashboard.support.list')
  }
});