define(["microcore", "mst!/layouts/view", "mst!/incoming/edit/index", "notify", "scripts"],
  function (mc, view, incoming_view, notify, scripts) {

      let incoming, is_copy;

      mc.events.on('next', () => {
          if (incoming.name === '') {
              return scripts.fieldError('#common [name=name]', 0)
          }
          if (!incoming.start_materials.length) {
              if ($('ul.tabs li.active a').attr('href') === '#tab=common' || $('ul.tabs li.active a').attr('href') === '#tab=ivr') {
                  return $('ul.tabs li.active + li').removeClass('disabled').find('a')[0].click()
              } else {
                  return scripts.fieldError('#materials .select', 2)
              }
          } else if (!incoming.blacklists.length) {
              if ($('ul.tabs li.active a').attr('href') === '#tab=materials') {
                  return $('ul.tabs li.active + li').removeClass('disabled').find('a')[0].click()
              }
              return scripts.fieldError('#blacklists .select', 3)
          }
          $('ul.tabs li.active + li').removeClass('disabled').find('a')[0].click()

      })

      mc.events.on("incoming.save", (btn) => {
          if (is_copy) {
              delete incoming.id
          }
          let method = incoming.id ? 'update' : 'create';
          if (incoming.name === '') {
              return scripts.fieldError('#common [name=name]', 0)
          } else if (!incoming.start_materials.length) {
              return scripts.fieldError('#materials .select', 2)
          }
          btn.setAttribute('disabled', true)
          mc.api.call('communications.incoming.' + method, incoming).then(res => {
              if (res) {
                  notify(mc.i18n(`incoming.${method === 'create' ? 'created' : 'updated'}`))
                  mc.router.go(`/${incoming.project_id}/incoming/`)
              } else {
                  btn.removeAttribute('disabled')
                  notify(mc.i18n('system.error'))
              }
          })
      });

      mc.events.on('sys:page.init:incoming/edit/index', () => {

      });

      return async function (params) {
          document.title = `${mc.i18n('incoming.title')} | Botto Platform`;
          mc.storage.set('incoming', {
              phone: null,
              start_materials: [],
              name: '',
              project_id: mc.storage.get('project_id'),
              blacklists: []
          });
          incoming = mc.storage.get('incoming')

          if (+params.id) {
              incoming = await mc.api.call('communications.incoming.get',
                {project_id: incoming.project_id, id: +params.id})
                .then(res => res);
              if (!incoming) {
                  return mc.router.go(`/${mc.storage.get('project_id')}/404`)
              }
              is_copy = params.mode === 'clone';
              /* if (is_copy) {
                  incoming.name = `${mc.i18n('incoming.incoming')} #${Math.floor(Math.random() * 1000000)}`
              }*/
              mc.storage.set('incoming', incoming)
              return view({
                  title: mc.i18n('incoming.edit'),
                  back: `/${mc.storage.get('project_id')}/incoming/`,
                  tabs: [
                      {
                          title: mc.i18n('edit.common'),
                          active: true,
                          link: `#tab=common`
                      },
                      {
                          title: mc.i18n('mailings.settings.ivr'),
                          active: false,
                          disabled: false,
                          link: `#tab=ivr`
                      },
                      {
                          title: mc.i18n('materials.title'),
                          active: false,
                          disabled: false,
                          link: `#tab=materials`
                      },
                      {
                          title: mc.i18n('blacklists.title'),
                          active: false,
                          disabled: false,
                          link: `#tab=blacklists`
                      },
                  ],
                  content: await incoming_view({
                      id: incoming.id
                  })
              });
          } else {
              incoming.name = `${mc.i18n('incoming.incoming')} #${Math.floor(Math.random() * 1000000)}`
              return view({
                  title: mc.i18n('incoming.create'),
                  back: `/${mc.storage.get('project_id')}/incoming/`,
                  tabs: [
                      {
                          title: mc.i18n('edit.common'),
                          active: true,
                          link: `#tab=common`
                      },
                      {
                          title: mc.i18n('mailings.settings.ivr'),
                          active: false,
                          disabled: true,
                          link: `#tab=ivr`
                      },
                      {
                          title: mc.i18n('materials.title'),
                          active: false,
                          disabled: true,
                          link: `#tab=materials`
                      },
                      {
                          title: mc.i18n('blacklists.title'),
                          active: false,
                          disabled: true,
                          link: `#tab=blacklists`
                      },
                  ],
                  content: await incoming_view()
              });
          }
      }
  });