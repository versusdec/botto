define([
      'microcore',
      'mst!settings/edit/option',
      "confirm",
      "notify"
  ],
  function (mc, option, confirm, notify) {

      async function addOption() {
          $('#options tbody').append(await option({id: optionId}));
          optionId++
      }

      const ID = () => {
          return '_' + Math.random().toString(36).substr(2, 9);
      };

      let project, type = 'string', optionId = 1;

      mc.events.on('settings.fields.type.change', async (selected) => {
          type = selected.value;
          if (type === "select") {
              optionId = 1;
              $('#options tbody').html('');
              await addOption();
              $('#options, .option-add').removeClass('hide');
          } else {
              $('#options, .option-add').addClass('hide');
          }
      })

      mc.events.on("fields.options.add", async (button) => {
          await addOption();
      });

      mc.events.on("fields.options.remove", async (button) => {
          $(button).closest('tr').remove();
      });

      mc.events.on("settings.fields.save", async ({id, btn, external}) => {
          let data = {
              type: type,
              project_id: mc.storage.get('project_id')
          };
          let method = 'create';
          let fieldset = $(btn).closest('.fieldset');
          if (!$(fieldset).find('[name=name]').val().length || !$(fieldset).find('[name=var]').val().length) {
              return mc.fieldError($(fieldset).find('[required]'))
          }
          data.name = fieldset.find('[name=name]').val();
          data.variable = fieldset.find(' [name=var]').val();
          if (type === 'select') {
              if (!$('[name=option_id]').length) {
                  return notify(mc.i18n('settings.fields.options.empty'))
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

          if (+id) {
              data.id = +id;
              method = 'update'
          }
          mc.api.call('projects.fields.' + method, data).then(res => {
              if (res) {
                  if (!external) {
                      mc.router.go(`/${mc.storage.get('project_id')}/settings/active/fields/`)
                  } else {
                      $(btn).closest('.popup-wrapper').remove();
                  }
                  notify(mc.i18n(`settings.fields.${+id ? 'updated' : 'created'}`))
                  mc.events.push('fields.created', {id: res})
              } else {
                  notify(mc.i18n(`system.error`))
              }
          })

      });

      return async ($scope, $params) => {

      }
  });