define([
    'microcore',
    'mst!support/ticket/item',
    'app/modules/notify',
], function (mc, item_view, notify) {

    return async function ($scope, $params) {
        let hash_params = mc.router.hash();
        let page = parseInt(hash_params.page) || 1;
        let limit = parseInt(hash_params.limit) || 10;
        mc.api.call("support.get", {
            id: parseInt($params.id)
            /*limit: limit,
            offset: (page - 1) * limit*/
        }).then(async function (res) {
            if (res) {
                $($scope).html('');
                for (let i in res.messages) {
                    let item = res.messages[i];
                    item.domain = require.config.api;
                    $($scope).append(await item_view(item))
                }
            } else {
                notify(mc.i18n('system.error'))
            }

            /*mc.events.push('system:pagination.update', {
              total: res.total,
              limit: limit,
              current: page
            })*/
        })
    }
});