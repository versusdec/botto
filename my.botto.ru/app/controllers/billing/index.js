define(["microcore", "mst!/billing/index"], function (mc, view) {

  mc.events.on('sys:page.init:billing/index', function () {

  });

  mc.events.on('topup:stats.update', (data) => {
    for (let key in data) {
      let value = data[key];
      $('span[data-' + key + ']').text(value)
    }
  });

  return async function (params) {
    document.title = `${mc.i18n('billing.title')} | Botto Platform`;
    let user = await mc.api.call('users.me');

    return view({
      page: params.page,
      balance: user.balance,
      role: user.settings.role,
      statuses: [
        {
          option: mc.i18n('status.all'),
          value: 'all'
        },
        {
          option: mc.i18n('status.new'),
          value: 'new'
        },
        {
          option: mc.i18n('status.pending'),
          value: 'pending'
        },
        {
          option: mc.i18n('status.success'),
          value: 'succeeded'
        },
        {
          option: mc.i18n('status.declined'),
          value: 'canceled'
        }
      ],
      filter: {
        period_start: mc.i18n('filter.period_start'),
        period_end: mc.i18n('filter.period_end')
      }

    });
  }
});