define(["microcore", "mst!/projects/edit/index", "mst!/projects/edit/popup", "/app/modules/notify", "popup"],
  function (mc, view, settings, notify, popup) {

      let project = {
          sections: {}
      };

      function field_error(field, tab) {
          $('ul.tabs li a')[tab].click();
          $(field).addClass('error');
          setTimeout(() => {
              $(field).removeClass('error')
          }, 3000);
          return false
      }

      function prepareBatch() {
          let payload = [];
          for (let key in project.sections) {
              if (project.sections[key]) {
                  for (let id in project.sections[key]) {
                      let method = `projects.${key}.` + (project.sections[key][id].id ? 'update' : key === 'users' ? 'add' : 'create');
                      if (project.sections[key][id].delete) {
                          key === 'users' ? method = 'projects.users.delete' : project.sections[key][id].status = 'archived'
                      }
                      project.sections[key][id].project_id = project.id;
                      payload.push({
                          method: method,
                          params: project.sections[key][id]
                      })
                  }
              }
          }

          return payload;
      }

      mc.events.on('project.name.change', name => {
          project.name = name;
      });

      mc.events.on('project.desc.change', desc => {
          project.description = desc;
      });

      mc.events.on('project.apps.change', () => {
          project.applications = [];
          $('[data-status=true]').forEach(e => {
              project.applications.push(e.dataset.application)
          });
      });

      mc.events.on('projects.settings.popup', () => {
          popup(settings, project)
      });

      mc.events.on("projects.settings.tab", ({tab, btn}) => {
          $('.project_settings .tabs li').removeClass('active');
          $(btn).closest('li').addClass('active');
          $('.project_settings .tab').addClass('hide');
          $(`#${tab}`).removeClass('hide')
      });

      mc.events.on('projects.settings.save', (btn) => {
          project.sections = {
              fields: mc.storage.get('project.fields'),
              tags: mc.storage.get('project.tags'),
              users: mc.storage.get('project.users'),
          }
          $(btn).closest('.popup-wrapper').remove()
      });

      mc.events.on("projects.create", (btn) => {
          if (!$('[name=name]').val().length) {
              return field_error('[name=name]', 0)
          } else {
              btn.setAttribute('disabled', true)
              let item = {
                  name: project.name
              };

              project.description ? item.description = project.description : void 0;
              project.applications && project.applications.length ? item.applications = project.applications : void 0;
              mc.api.call('projects.create', item).then((res) => {
                  if (res) {
                      project.id = res;
                      let payload = prepareBatch();
                      if (payload.length) {
                          mc.api.batch(payload).then(res => {
                              if (res)
                                  notify(mc.i18n('projects.created'));
                              else
                                  notify(mc.i18n('projects.error_on_create'));
                              mc.router.go('/projects/list')
                          })
                      } else {
                          notify(mc.i18n('projects.created'));
                          mc.router.go('/projects/list')
                      }
                  } else {
                      notify(mc.i18n('system.error'))
                      btn.removeAttribute('disabled')

                  }
              })
          }
      });

      mc.events.on("projects.update", (btn) => {
          if (!$('[name=name]').val().length) {
              return field_error('[name=name]', 0)
          } else {
              btn.setAttribute('disabled', true)

              let update = true, bat = true;
              if (project.name || project.description || project.applications) {
                  let item = {
                      id: project.id
                  };
                  project.name ? item.name = project.name : void 0;
                  project.description ? item.description = project.description : void 0;
                  project.applications && project.applications.length ? item.applications = project.applications : void 0;
                  mc.api.call('projects.update', item).then(res => {
                      if (!res)
                          update = false;
                  })
              }

              let payload = prepareBatch();
              console.log(payload);

              payload.length && mc.api.batch(payload).then(res => {
                  if (!res)
                      bat = false;
              })

              if (update && bat) {
                  notify(mc.i18n('projects.updated'));
                  mc.router.go('/projects/list')
              } else {
                  notify(mc.i18n('projects.error_on_create'));
                  btn.removeAttribute('disabled')

              }
          }
      });

      mc.events.on('sys:page.init:projects/edit/index', () => {
          $('button[data-application]').on('click', function () {
              if ($(this).attr('data-status') === 'connect') {
                  $(this).attr('data-status', true).text(mc.i18n('button.disconnect'));
                  $(this).addClass('secondary');
              } else {
                  $(this).attr('data-status', 'connect').text(mc.i18n('button.connect'));
                  $(this).removeClass('secondary');
              }
              mc.events.push('project.apps.change')
          });

          $('button[data-next]').on('click', function () {
              if ($('#about [name=name]').val().length) {
                  $('ul.tabs li.active + li').removeClass('disabled');
                  $('ul.tabs li.active + li > a')[0].click()
              } else {
                  $('ul.tabs li:not(:first-child)').addClass('disabled');
                  return field_error('#about [name=name]', 0)
              }
          })
      });

      return async function (params) {
          document.title = `${mc.i18n('projects.title')} | Botto Platform`;
          mc.storage.set('project', {
              sections: {}
          });
          project = mc.storage.get('project')
          project.shared = false;

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

          if (+params.id) {
              let item = await mc.api.call('projects.get', {id: +params.id});
              if (!item) {
                  return mc.router.go(`/404`)
              }

              project.id = item.id;
              if (item.shared) {
                  project.shared = true
              }
              if (item.applications && item.applications.length) {
                  item.applications.forEach(function (application) {
                      applications.forEach(function (item) {
                          if (item.name === application) {
                              item.connected = 'true'
                          }
                      })
                  })
              }
              console.log(item);
              return view({project: item, apps: applications, title: mc.i18n('projects.edit.edit'), id: item.id});
          } else {
              return view({id: 'new', title: mc.i18n('projects.edit.create'), apps: applications});
          }
      }
  });