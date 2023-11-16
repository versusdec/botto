define(['microcore', 'mst!support/list/item', "/app/modules/confirm", "/app/modules/notify"],
  function (mc, item_view, confirm, notify) {
    let filter = {}, page;

    mc.events.on('ticket.archive', (id) => {
      confirm(mc.i18n('support.actions.archive'), '', () => {
        mc.api.call('support.archive', {id: parseInt(id)})
          .then(res => {
            if (res) {
              notify(mc.i18n('support.actions.archived'));
              mc.router.go(location.pathname)
            } else
              notify(mc.i18n('system.error'))
          })
      })
    });

    mc.events.on('ticket.close', (id) => {
      confirm(mc.i18n('support.actions.close'), '', () => {
        mc.api.call('support.close', {id: parseInt(id)})
          .then(res => {
            if (res) {
              notify(mc.i18n('support.actions.closed'));
              mc.router.go(location.pathname)
            } else
              notify(mc.i18n('system.error'))
          })
      })
    });

    mc.events.on('ticket.reopen', (id) => {
      confirm(mc.i18n('support.actions.open'), '', () => {
        mc.api.call('support.reopen', {id: parseInt(id)})
          .then(res => {
            if (res) {
              notify(mc.i18n('support.actions.opened'));
              mc.router.go(location.pathname)
            }
            else
              notify(mc.i18n('system.error'))
          })
      })
    });

    return async ($scope, $params) => {
      let hash_params = mc.router.hash();
      page = parseInt(hash_params.page) || 1;
      filter.limit = parseInt(hash_params.limit) || 10;
      filter.offset = (page - 1) * filter.limit;
      let tab = $params.tab.length ? $params.tab : 'tech';
      switch (tab) {
        case 'tech':
        case 'finance':
          filter.theme = tab;
          filter.status = ['active', 'closed'];
          // delete filter.status
          break;
        case 'archived':
          filter.status = tab;
          delete filter.theme;
          break;
        default:
          break;
      }

      let tickets = await mc.api.call("support.list", filter);

      if (tickets && tickets.items && tickets.items.length) {
        $($scope).find('tbody').html('');
        for (let i in tickets.items) {
          let item = tickets.items[i];

          $($scope).find('tbody').append(await item_view(item))
        }
        mc.events.push('support:stats.update', {
          total: tickets.total
        });
        mc.events.push('system:pagination.update', {
          id: 'support',
          total: tickets.total,
          limit: tickets.limit,
          current: filter.offset / filter.limit + 1
        })
      } else {
        $($scope).find('.loader').html(mc.i18n('table.empty'))
      }


    }
  });