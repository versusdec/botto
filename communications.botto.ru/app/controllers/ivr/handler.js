define(['microcore', 'mst!ivr/item', "confirm", "notify"],
    function (mc, item_view, confirm, notify) {
        let filter = {
            project_id: mc.storage.get('project_id'),
            status: 'active'
        }, page;

        mc.events.on('ivr.archive', ({id, btn}) => {
            confirm(mc.i18n('ivr.archive'), '', () => {
                mc.api.call('communications.ivr.update', {
                    id: +id,
                    project_id: mc.storage.get('project_id'),
                    status: 'archived'
                })
                    .then(res => {
                        if (res) {
                            notify(mc.i18n('ivr.archived'));
                            $(btn).closest('tr').remove()
                        } else
                            notify(mc.i18n('system.error'))
                    })
            })
        });

        mc.events.on('ivr.unzip', (id) => {
            confirm(mc.i18n('ivr.unzip'), '', () => {
                mc.api.call('communications.ivr.update', {
                    id: +id,
                    project_id: mc.storage.get('project_id'),
                    status: 'active'
                })
                    .then(res => {
                        if (res) {
                            notify(mc.i18n('ivr.unzipped'));
                            mc.router.go(location.pathname)
                        } else
                            notify(mc.i18n('system.error'))
                    })
            })
        });

        mc.events.on('ivr.list', async (scope) => {
            let response = await mc.api.call(`communications.ivr.list`, filter);

            if (response && response.items && response.items.length) {
                $(scope).find('tbody').html('');
                for (let i in response.items) {

                    let item = response.items[i];

                    $(scope).find('tbody').append(await item_view(item))
                }

                mc.events.push('system:pagination.update', {
                    id: 'ivr',
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
            filter.status = 'active';

            if ($params.tab.length) {
                filter.status = 'archived'
            }

            mc.events.push('ivr.list', $scope)
        }
    });