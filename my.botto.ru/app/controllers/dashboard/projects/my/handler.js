define(['microcore', 'mst!dashboard/projects/my/item', 'app/modules/confirm', 'app/modules/notify',], function (mc, item_view, confirm, notify) {

  let scope;

  mc.events.on('dashboard.projects.archive', (id) => {
    confirm(mc.i18n('projects.confirm_archive'), '', () => {
      mc.api.call('projects.update', {id: parseInt(id), status: 'archived'})
        .then(res => {
          if (res) {
            notify(mc.i18n('projects.archived'));
            mc.events.push('dashboard.projects.list')
          } else
            notify(mc.i18n('system.error'))
        })
    })
  });

  mc.events.on('dashboard.projects.list', async () => {
    let projects = await mc.api.call("projects.my", {
      limit: 3,
      status: 'active'
    });

    if (projects && projects.items && projects.items.length) {
      $(scope).find('table > tbody').html('');
      for (let i in projects.items) {
        let item = projects.items[i];
        if (item.applications && item.applications.length) {
          let apps = [];
          for (let i in item.applications){
            apps.push({name: item.applications[i]})
          }
          item.applications = apps
        }
        $(scope).find('table > tbody').append(await item_view(item))
      }
      mc.events.push('routeChange')
    } else {
      $(scope).find('table > tbody .loader').text(mc.i18n('table.empty'))
    }
  });

  return async ($scope, $params) => {
    scope = $scope;
    mc.events.push('dashboard.projects.list')
  }
});