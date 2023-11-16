define(["microcore", "mst!/layouts/view", "mst!/mailings/edit/index", "notify"],
  function (mc, view, mailing_view, notify) {

      let mailing, is_copy;

      mc.events.on('next', () => {
          if (mailing.name === '') {
              return mc.fieldError('#common [name=name]', 0)
          }
          if (!mailing.phones.length) {
              return mc.fieldError('#phones .select', 0)
          } else if (!mailing.start_materials.length) {
              if ($('ul.tabs li.active a').attr('href') === '#tab=common' || $('ul.tabs li.active a').attr('href') === '#tab=ivr') {
                  return $('ul.tabs li.active + li').removeClass('disabled').find('a')[0].click()
              } else {
                  return mc.fieldError('#materials .select', 2)
              }
          } else if (!mailing.bases.length) {
              if ($('ul.tabs li.active a').attr('href') === '#tab=materials') {
                  return $('ul.tabs li.active + li').removeClass('disabled').find('a')[0].click()
              }
              return mc.fieldError('#bases .select', 3)
          }
          $('ul.tabs li.active + li').removeClass('disabled').find('a')[0].click()

      })

      mc.events.on("mailings.save", (btn) => {
          if (is_copy) {
              delete mailing.id
          }
          let method = mailing.id ? 'update' : 'create';
          if (mailing.name === '') {
              return mc.fieldError('#common [name=name]', 0)
          } else if (!mailing.phones.length) {
              return mc.fieldError('#phones .select', 0)
          } else if (!mailing.start_materials.length) {
              return mc.fieldError('#materials .select', 2)
          } else if (!mailing.bases.length) {
              return mc.fieldError('#bases .select', 3)
          }
          btn.setAttribute('disabled', true)
          mc.api.call('communications.mailings.' + method, mailing).then(res => {
              if (res) {
                  notify(mc.i18n(`mailings.${method === 'create' ? 'created' : 'updated'}`))
                  mc.router.go(`/${mailing.project_id}/mailings/`)
              } else {
                  btn.removeAttribute('disabled')
                  notify(mc.i18n('system.error'))
              }
          })
      });

      mc.events.on('sys:page.init:mailings/edit/index', () => {

      });

      return async function (params) {
          document.title = `${mc.i18n('mailings.title')} | Botto Platform`;
          mc.storage.set('mailing', {
              phones: [],
              start_materials: [],
              name: '',
              speed: 3600,
              bases: [],
              project_id: mc.storage.get('project_id'),
              max_leads: 0,
              schedule: [],
              max_spent: 0,
              records: false,
              blacklists: [],
              response_timeout: 27,
              action_timeout: 7,
          });
          mailing = mc.storage.get('mailing')

          if (+params.id) {
              mailing = await mc.api.call('communications.mailings.get',
                {project_id: mailing.project_id, id: +params.id})
                .then(res => res);
              if (!mailing) {
                  return mc.router.go(`/${mc.storage.get('project_id')}/404`)
              }
              is_copy = params.mode === 'clone';
              /* if (is_copy) {
                  mailing.name = `${mc.i18n('mailings.mailing')} #${Math.floor(Math.random() * 1000000)}`
              }*/
              if (!Array.isArray(mailing.schedule)) {
                  mailing.schedule = []
              }
              mc.storage.set('mailing', mailing)
              return view({
                  title: mc.i18n('mailings.edit') + ` #${params.id}`,
                  back: `/${mc.storage.get('project_id')}/mailings/`,
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
                          title: mc.i18n('contacts.contacts'),
                          active: false,
                          disabled: false,
                          link: `#tab=bases`
                      },
                      {
                          title: mc.i18n('blacklists.title'),
                          active: false,
                          disabled: false,
                          link: `#tab=blacklists`
                      },
                      /*{
                          title: mc.i18n('mailings.schedule.title'),
                          active: false,
                          disabled: false,
                          link: `#tab=schedule`
                      },*/
                      {
                          title: mc.i18n('mailings.settings.title'),
                          active: false,
                          disabled: false,
                          link: `#tab=settings`
                      }

                  ],
                  content: await mailing_view({
                      id: mailing.id
                  })
              });
          } else {
              mailing.name = `${mc.i18n('mailings.mailing')} #${Math.floor(Math.random() * 1000000)}`
              return view({
                  title: mc.i18n('mailings.create'),
                  back: `/${mc.storage.get('project_id')}/mailings/`,
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
                          title: mc.i18n('contacts.contacts'),
                          active: false,
                          disabled: true,
                          link: `#tab=bases`
                      },
                      {
                          title: mc.i18n('blacklists.title'),
                          active: false,
                          disabled: true,
                          link: `#tab=blacklists`
                      },
                      /*{
                          title: mc.i18n('mailings.schedule.title'),
                          active: false,
                          disabled: true,
                          link: `#tab=schedule`
                      },*/
                      {
                          title: mc.i18n('mailings.settings.title'),
                          active: false,
                          disabled: true,
                          link: `#tab=settings`
                      }

                  ],
                  content: await mailing_view()
              });
          }
      }
  });