define(['microcore', "mst!/bases/edit/edit", "mst!/bases/edit/preview",
      "mst!/bases/edit/popup", "notify", "confirm", "popup"],
  function (mc, view, pre_view, popup_view,
            notify, confirm, popup) {

      let base, type = 'file', base_type, name_changed = false, contacts_type, phoneSelect;
      const options = [
          {option: mc.i18n('bases.add.file'), value: 'file'},
          {option: mc.i18n('bases.add.list'), value: 'list'},];

      function prepareMatching() {
          let matching = [];
          $('#preview tr:first-child td').forEach(e => {
              if ($(e).find('.select > .option')[0].dataset.value === 'phone') {
                  base.phone_column = +e.dataset.col;
              } else {
                  matching.push({column: +e.dataset.col, field_id: +$(e).find('.select > .option')[0].dataset.value})
              }
          })
          return matching
      }

      mc.events.on('base.name.change', name => {
          base.name = name;
          name_changed = true;
      });

      mc.events.on('bases.field.select', select => {
          // console.log(select);
          if (select.value !== 'not_selected') {
              let options = $(`#preview .select:not(#${select.id}) .option[data-value='${select.value}']`)
              if (options.length) {
                  options.find(`li[data-value=not_selected]`)[0].click()
              }
          }
      });

      mc.events.on('base.contacts.change', value => {
          base.contacts = value;
      });

      mc.events.on('bases.add.type.change', select => {
          $('.add_type').toggleClass('hide');
          type = select.value;
          if (type === 'file') {
              base.contacts ? delete base.contacts : void 0;
          } else {
              base.file ? delete base.file : void 0;
          }
      });

      mc.events.on('bases.contacts.add', () => {
          type = 'file';
          contacts_type = 'add';
          popup(popup_view, {options: options, ct: contacts_type})
      })

      mc.events.on('bases.contacts.remove', () => {
          type = 'file';
          contacts_type = 'exclude'
          popup(popup_view, {options: options, ct: contacts_type})
      })

      mc.events.on('bases.file.upload', async (files) => {
          base.contacts ? delete base.contacts : void 0;
          base.file = files[0].path;
          if (contacts_type === 'add' && base_type !== 'blacklists') {
              $('#preview').removeClass('hide');
              let preview = await mc.api.call('communications.bases.preview', {file: base.file});
              if (preview) {
                  if (preview.length > 10) {
                      preview = preview.slice(0, 9)
                  }
                  const fields = await mc.api.call('projects.fields.list', {
                      status: 'active',
                      project_id: base.project_id
                  })
                  let options = [{option: mc.i18n('table.not_selected'), value: 'not_selected'},
                      {option: mc.i18n('user.phone'), value: 'phone'},]
                  if (fields && fields.items && fields.items.length) {
                      fields.items.forEach(field => {
                          options.push({option: field.name, value: field.id})
                      })
                  }
                  let length = [];
                  preview[0].forEach((e, i) => {
                      length.push({options: options, i: i + 1})
                  })
                  $('#preview').html(await pre_view({length: length, items: preview, options: options}));
                  console.log($('#preview').find('[data-col="1"] li[data-value="phone"]'));
                  setTimeout(() => {
                      $('#preview [data-col="1"] li[data-value="phone"]')[0].click()
                  }, 300)
              }
          }
      })

      mc.events.on('bases.contacts.apply', (btn) => {
          let payload = {
              id: base.id,
              project_id: base.project_id,
          }
          if (type === 'file') {
              if (base.file) {
                  payload.file = base.file;
                  if (contacts_type === 'add' && base_type !== 'blacklists') {
                      payload.matching = prepareMatching();
                      payload.phone_column = base.phone_column;
                  }
              }
          } else {
              payload.contacts = base.contacts;
          }

          mc.api.call(`communications.${base_type}.contacts.${contacts_type}`, payload).then(res => {
              if (res) {
                  if (contacts_type === 'add')
                      notify(mc.i18n('contacts.include.included'));
                  else
                      notify(mc.i18n('contacts.exclude.excludeds'));
                  $(btn).closest('.popup-wrapper').remove();
              } else {
                  notify(mc.i18n('system.error'));
              }
          })
      })

      mc.events.on("bases.save", async ({btn}) => {
          if (base.name === '') {
              return mc.fieldError('[name=name]')
          } else {
              btn.setAttribute('disabled', true)

              let reg = new RegExp('/' + base_type + '/', 'i')
              if (!base.id) {
                  if (type === 'file' && base_type !== 'blacklists') {
                      base.matchings = prepareMatching()
                  } else {
                      base.phone_column ? delete base.phone_column : void 0;
                  }
                  mc.api.call(`communications.${base_type}.create`, base)
                    .then(res => {
                        if (res) {
                            notify(mc.i18n(`${base_type}.created`))
                            mc.events.push(`bases.created`, {id: res, type: base_type})
                            if (location.pathname.match(reg)) {
                                mc.router.go(`/${mc.storage.get('project_id')}/database/${base_type}/`)
                            } else {
                                $(btn).closest('.popup-wrapper').remove();
                            }
                        } else {
                            btn.removeAttribute('disabled')
                            notify(mc.i18n('system.error'))
                        }
                    })
              } else {
                  if (name_changed) {
                      mc.api.call(`communications.${base_type}.update`, {
                          id: base.id,
                          project_id: base.project_id,
                          name: base.name
                      }).then(res => {
                          if (res) {
                              notify(mc.i18n(`${base_type}.updated`));
                              mc.events.push(`bases.updated`, base)
                              //mc.router.go(`/${mc.storage.get('project_id')}/database/${base_type}/`)
                          } else {
                              //btn.removeAttribute('disabled')
                              notify(mc.i18n('system.error'))
                          }
                          if (location.pathname.match(reg)) {
                              mc.router.go(`/${mc.storage.get('project_id')}/database/${base_type}/`)
                          } else {
                              $(btn).closest('.popup-wrapper').remove();
                          }
                      })
                  } else {
                      if (location.pathname.match(reg)) {
                          mc.router.go(`/${mc.storage.get('project_id')}/database/${base_type}/`)
                      } else {
                          $(btn).closest('.popup-wrapper').remove();
                      }
                      //mc.router.go(`/${mc.storage.get('project_id')}/database/${base_type}/`)
                  }
              }
          }
      });

      return ($scope, $params) => {
          phoneSelect = false;
          contacts_type = 'add'
          base_type = $params.type
          name_changed = false;
          base = mc.storage.get('base');
      }
  });