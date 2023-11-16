define(['microcore', 'mst!dashboard/projects/shared/item', 'app/modules/confirm', 'app/modules/notify',], function (mc, item_view, confirm, notify) {

    /*mc.events.on('dashboard.projects.archive', (id) => {
      confirm(mc.i18n('projects.confirm_archive'), () => {
        mc.api.call('projects.update', {id: parseInt(id), status: 'archived'})
          .then(res => {
            if (res)
              notify(mc.i18n('projects.archived'))
            else
              notify(mc.i18n('system.error'))
          })
      })
    });*/

    return async ($scope, $params) => {
        let projects = await mc.api.call("projects.shared", {
            limit: 3,
            status: 'active'
        });

        if (projects && projects.items && projects.items.length) {
            $($scope).removeClass('hide')
            $($scope).find('table > tbody').html('');
            for (let i in projects.items) {
                let item = projects.items[i];
                if (item.applications && item.applications.length) {
                    let apps = [];
                    for (let i in item.applications) {
                        apps.push({name: item.applications[i]})
                    }
                    item.applications = apps
                }
                $($scope).find('table > tbody').append(await item_view(item))
            }
            mc.events.push('routeChange')

        } else {
            // $($scope).remove()
            // $($scope).find('table > tbody .loader').text(mc.i18n('table.empty'))
        }
    }
});