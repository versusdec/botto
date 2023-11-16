define([
    'microcore',
    'mst!billing/topup/item',
    'mst!profile/popup',
    'app/modules/popup',
    'app/modules/notify',
    'app/modules/confirm',
    "scripts"
], function (mc, item_view, profile, popup, notify, confirm, scripts) {
    let payload = {
        type: 'yandex'
    }, filter = {}, page;

    mc.events.on('topup.show', async (btn) => {
        scripts.loading(true);
        const user = await mc.api.call('users.me').then(res => {
            scripts.loading(false);
            if (res) {
                return res
            } else {
                notify(mc.i18n('system.error'));
                return false
            }
        })
        if (user) {
            if (!user.name || !user.second_name || !user.surname || !user.phone) {
                popup(profile, {user: user, topup: true})
            } else {
                $('#topup').removeClass('hide');
                $(btn).addClass('hide');
            }
        }
    });

    mc.events.on('topup.accept', (role) => {
        let method = 'create';
        if ($('#topup [name=amount]').val().length) {
            payload.amount = parseInt($('#topup [name=amount]').val());
            if ($('#topup [name=promo]').val().length) {
                // payload.type = 'promocode';
                payload.code = $('#topup [name=promo]').val()
            }
        } else {
            return scripts.fieldError('[name=amount]')
        }
        mc.api.call('payments.' + method, payload).then(res => {
            if (res && res.payment_url) {
                mc.router.go(location.pathname);
                const link = document.createElement('a')
                link.setAttribute('href', res.payment_url)
                link.setAttribute('target', '_blank')
                link.click()
            } else {
                notify(mc.i18n('system.error'))
            }
        })
    });

    mc.events.on('payments.pay', (id) => {
        mc.api.call('payments.pay', {id: parseInt(id)}).then(res => {
            console.log(res);
            if (res && res.payment_url) {
                location.href = res.payment_url;
                /*const link = document.createElement('a')
                link.setAttribute('href', res.payment_url)
                link.setAttribute('target', '_blank')
                link.click()*/
            } else
                notify(mc.i18n('system.error'))
        })
    });

    mc.events.on('payments.cancel', (id) => {
        confirm(mc.i18n('system.confirm'), '', () => {
            mc.api.call('payments.cancel', {id: parseInt(id)}).then(res => {
                if (res) {
                    mc.router.go(location.pathname)
                } else
                    notify(mc.i18n('system.error'))
            })
        })
    });

    mc.events.on('topup.filter.range.start', async (selected) => {
        console.log(selected);
        if (filter.created) {
            filter.created.start = Math.floor(new Date(selected.value).getTime() / 1000)
        } else {
            filter.created = {};
            filter.created.start = Math.floor(new Date(selected.value).getTime() / 1000)
        }
    });

    mc.events.on('topup.filter.range.end', async (selected) => {
        if (filter.created) {
            filter.created.end = Math.floor(new Date(selected.value).getTime() / 1000)
        } else {
            filter.created = {};
            filter.created.end = Math.floor(new Date(selected.value).getTime() / 1000)
        }
    });

    mc.events.on('topup.filter.status.change', async (selected) => {
        filter.status = selected.value
    });

    mc.events.on('topup.filter.reset', async () => {
        filter = {}
        mc.router.go(location.pathname)
    });

    mc.events.on('topup.filter', async ($scope) => {
        filter.offset = (page - 1) * filter.limit;
        let payments = await mc.api.call("payments.list", filter);
        if (payments && payments.items && payments.items.length) {
            $($scope).find('table > tbody').html('');
            for (let i in payments.items) {
                let item = payments.items[i];
                $($scope).find('table > tbody').append(await item_view(item))
            }
        } else {
            $($scope).find('.loader').html(mc.i18n('table.empty'))
        }

        mc.events.push('topup:stats.update', {
            total: payments.total
        });

        mc.events.push('system:pagination.update', {
            id: 'payments',
            total: payments.total,
            limit: payments.limit,
            current: page
        })
    });

    return async function ($scope, $params) {
        let hash_params = mc.router.hash();
        page = parseInt(hash_params.page) || 1;
        filter.limit = parseInt(hash_params.limit) || 10;
        filter.offset = (page - 1) * filter.limit;

        await mc.events.push('topup.filter', $scope);
    }
});