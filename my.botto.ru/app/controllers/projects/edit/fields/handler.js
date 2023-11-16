define([
      'microcore',
      'mst!projects/edit/fields/item',
      'mst!projects/edit/fields/edit',
      'mst!projects/edit/fields/option',
      "/app/modules/confirm",
      "/app/modules/notify",
      "/app/modules/popup",
      "/app/modules/sortable"
  ],
  function (mc, item_view, fields, option, confirm, notify, popup, Sortable) {

      async function addOption() {
          $('#options tbody').append(await option({id: optionId}));
          optionId++
      }

      const ID = () => {
          return '_' + Math.random().toString(36).substr(2, 9);
      };

      let project, fields_scope, type = 'string', optionId = 1, fields_popup, _fields,
        select_options = [{option: mc.i18n('projects.fields.options.string'), value: 'string'},
            {option: mc.i18n('projects.fields.options.int'), value: 'int'},
            {option: mc.i18n('projects.fields.options.select'), value: 'select'},
            {option: mc.i18n('projects.fields.options.phone'), value: 'phone'},
            {option: 'Email', value: 'email'},
            {option: mc.i18n('projects.fields.options.date'), value: 'date'},
            {option: mc.i18n('projects.fields.options.time'), value: 'time'},
            {option: mc.i18n('projects.fields.options.datetime'), value: 'datetime'},
            {option: mc.i18n('projects.fields.options.checkbox'), value: 'checkbox'}],
        onchange = async (selected) => {
            type = selected.value;
            if (type === "select") {
                optionId = 1;
                $('#options tbody').html('');
                await addOption();
                $('#options, .option-add').removeClass('hide');
            } else {
                $('#options, .option-add').addClass('hide');
            }
        };

      mc.events.on("projects.fields.add", async () => {
          type = 'string';
          popup(fields, {select_options: select_options, onchange: onchange, type: type})
            .then(popup => {
                fields_popup = popup;
            })
      });

      mc.events.on("fields.options.add", async (button) => {
          await addOption();
      });

      mc.events.on("fields.options.remove", async (button) => {
          $(button).closest('tr').remove();
      });

      mc.events.on("projects.fields.save", async ({id, btn, tempID}) => {
          let data = {
              type: type
          };

          let fieldset = $(btn).closest('.fieldset');
          if (!$(fieldset).find('[name=name]').val().length || !$(fieldset).find('[name=var]').val().length) {
              return mc.fieldError($(fieldset).find('[required]'))
          }
          data.name = fieldset.find('[name=name]').val();
          data.variable = fieldset.find(' [name=var]').val();
          if (type === 'select') {
              if (!$('[name=option_id]').length) {
                  return notify(mc.i18n('projects.fields.options.empty'))
              }
              if (!$('[name=option_id]').val().length) {
                  return mc.fieldError($('[name=option_id]'))
              }

              data.options = [];
              $('#options .field-option').forEach((e, i) => {
                  data.options.push({
                      name: $(e).find('[name=option]').val(),
                      variable: $(e).find('[name=option_var]').val(),
                      id: +$(e).find('[name=option_id]').val(),
                      pos: i
                  })
              })
          }
          if (!tempID) {
              tempID = ID();
          }
          if (+id) {
              data.id = +id;
              _fields[+id] = data;
              $(`#fields tbody [data-id="${id}"]`).remove()
          } else {
              data.tempID = tempID;
              _fields[tempID] = data;
              $(`#fields tbody [data-id="${tempID}"]`).remove()
          }
          $('#fields tbody tr').before(await item_view(data));
          fields_popup.remove();

      });

      mc.events.on('projects.fields.edit', async ({btn, id, tempID}) => {
          let item = {};
          if (+id) {
              item = _fields[+id] ? _fields[+id] : await mc.api.call('projects.fields.get', {
                  id: +id,
                  project_id: project.id
              });
          } else {
              item = _fields[tempID]
          }
          item.select_options = select_options;
          item.onchange = onchange;
          type = item.type;
          if (type === 'select') {
              item.options.sort((a, b) => {
                  return a.pos - b.pos
              });
              optionId = item.options.length + 1
          }
          popup(fields, item).then(popup => {
              fields_popup = popup;
              // sortable = Sortable.create($('#options tbody')[0], {handle: ".handle", animation: 150});
          });
      });

      mc.events.on('projects.fields.remove', ({id, tempID, btn}) => {
          confirm(mc.i18n('projects.fields.delete'), '', () => {
              if (+id) {
                  project.sections.fields[+id] = {
                      delete: true,
                      id: +id
                  }
              } else {
                  _fields[tempID] ? delete _fields[tempID] : void 0;
              }
              $(btn).closest('tr').remove()
          })
      });

      mc.events.on('projects.fields.list', async () => {
          let payload = {
              status: 'active'
          };
          project.id ? payload.project_id = project.id : void 0;
          let fields = await mc.api.call("projects.fields.list", payload);
          if (fields && fields.items && fields.items.length) {
              $(fields_scope).find('table > tbody').html('')
              for (let i in fields.items) {
                  let item = fields.items[i]
                  $(fields_scope).find('table > tbody').append(await item_view(item))
              }
          } else {
              $(fields_scope).find('table > tbody .loader').text(mc.i18n('table.empty'))
          }
      });

      return async ($scope, $params) => {
          project = mc.storage.get('project')
          mc.storage.set('project.fields', {})
          _fields = mc.storage.get('project.fields')

          fields_scope = $scope;
          mc.events.push('projects.fields.list')
      }
  });