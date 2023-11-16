define(["microcore", "mst!/projects/edit/archived", "/app/modules/notify"],
  function (mc, view, notify) {

      let project = {
          sections: {}
      };

      return async function (params) {
          document.title = `${mc.i18n('projects.title')} | Botto Platform`;
          mc.storage.set('project', {
              sections: {}
          });
          project = mc.storage.get('project')
          let applications = [
              {
                  name: 'communications',
                  description: mc.i18n('projects.apps.communications.description'),
                  available: true
              }, {
                  name: 'leads',
                  description: mc.i18n('projects.apps.leads.description')
              }, {
                  name: 'broker',
                  description: mc.i18n('projects.apps.broker.description')
              }
          ];

          let item = await mc.api.call('projects.get', {id: +params.id});
          if (!item) {
              return mc.router.go(`/404`)
          }

          if (item.applications.length) {
              item.applications.forEach(function (application) {
                  applications.forEach(function (item) {
                      if (item.name === application) {
                          item.connected = 'true'
                      }
                  })
              })
          }

          return view({project: item, apps: applications, title: mc.i18n('projects.edit.edit'), id: item.id});

      }
  });