define([
    'microcore',
    'mst!notifications/item',
    'app/modules/notify',
], function (mc, item_view, notify) {

    let status = 'not_read', scope;

    mc.events.on('status_change', select => {
        status = select.value;
        mc.events.push('notifications.list')
    });

    mc.events.on('notification.read', async ({link, n_id}) => {
        let {id} = await mc.auth.get();

        mc.api.call('notifications.read', {
            user_id: id,
            id: +n_id,
        })
          .then(res => {
              if (res) {
                  mc.api.call('notifications.list', {status: 'not_read', limit: 1}).then(res => {
                      mc.events.push('ws:notification', res[0])
                  })
                  // location.pathname = link;

              } else
                  notify(mc.i18n('system.error'))
          })
    });

    mc.events.on('notifications.list', () => {
        let hash_params = mc.router.hash();
        let page = parseInt(hash_params.page) || 1;
        let limit = parseInt(hash_params.limit) || 10;

        mc.api.call("notifications.list", {
            status: status
        }).then(async function (res) {
            console.log(res);
            if (res && res.length) {
                $(scope).find('tbody').html('');
                for (let i in res) {
                    let item = res[i];

                    $(scope).find('tbody').append(await item_view(item))
                }
            } else {
                if ($(scope).find('.loader').length)
                    $(scope).find('.loader').html(mc.i18n('table.empty'))
                else
                    $(scope).find('tbody').html(`<td colspan="3"><div class="loader">${mc.i18n('table.empty')}</div></td>`)
            }
        })

    })

    return async function ($scope, $params) {
        scope = $scope;
        mc.events.push('notifications.list')
    }
});