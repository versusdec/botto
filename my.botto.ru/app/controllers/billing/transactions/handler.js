define([
    'microcore',
    'mst!billing/transactions/item',
    'mst!billing/transactions/topup',
    'mst!billing/transactions/transaction',
    'mst!billing/payments/popup',
    'mst!billing/payments/payment',
    'app/modules/popup',
    'app/modules/notify',
], function (mc, item_view) {

    return async function ($scope, $params) {
        let hash_params = mc.router.hash();
        let page = parseInt(hash_params.page) || 1;
        let limit = parseInt(hash_params.limit) || 10;

        mc.api.call("transactions.list", {
            limit: limit,
            offset: (page - 1) * limit
        }).then(async function (res) {
            if (res && res.items && res.items.length) {
                $($scope).find('tbody').html('');
                let role = await mc.api.call('users.me').then(res => res.settings.role);
                for (let i in res.items) {
                    let item = res.items[i];
                    item.role = role;
                    $($scope).find('tbody').append(await item_view(item))
                }
            } else {
                $($scope).find('.loader').html(mc.i18n('table.empty'))
            }

            mc.events.push('system:pagination.update', {
                total: res.total,
                limit: limit,
                current: page
            })
        })
    }
});