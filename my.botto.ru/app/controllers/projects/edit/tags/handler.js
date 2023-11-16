define(['microcore', 'mst!projects/edit/tags/item', "/app/modules/confirm", "/app/modules/notify"],
  function (mc, item_view, confirm, notify) {

      let project, tags_scope, _tags;

      function field_error(field, tab) {
          // $('ul.tabs li a')[tab].click();
          $(field).addClass('error');
          setTimeout(() => {
              $(field).removeClass('error')
          }, 3000);
          return false
      }

      const ID = () => {
          return '_' + Math.random().toString(36).substr(2, 9);
      };

      mc.events.on("projects.tags.add", async (button) => {
          if (!$(tags_scope).find('[name=tag]').val().length) {
              return field_error($(tags_scope).find('[name=tag]'))
          } else {
              let tempID = ID();
              let data = {
                  tempID: tempID,
                  tag: $(tags_scope).find('[name=tag]').val()
              };
              $(tags_scope).find('.loader').remove();
              $(tags_scope).find('.list').append(await item_view(data));
              _tags[tempID] = data;
              $(tags_scope).find('[name=tag]').val('');
          }
      });

      mc.events.on("projects.tags.remove", async ({id, btn, tempID}) => {
          confirm(mc.i18n('projects.tags.confirm'), '', () => {
              if (+id) {
                  _tags[+id] = {
                      delete: true,
                      id: +id
                  }
              } else
                  delete _tags[tempID];
              $(btn).closest('.tag').remove()
          })
      });

      mc.events.on('projects.tags.list', async () => {
          let tags = await mc.api.call("projects.tags.list", {
              project_id: project.id,
              status: 'active'
          });

          if (tags && tags.items && tags.items.length) {
              $(tags_scope).find('.list').html('');
              for (let i in tags.items) {
                  let item = tags.items[i]
                  $(tags_scope).find('.list').append(await item_view(item))
              }
          } else
              $(tags_scope).find('.loader').text(mc.i18n('table.empty'))
      });

      return async ($scope, $params) => {
          project = mc.storage.get('project')
          mc.storage.set('project.tags', {})
          _tags = mc.storage.get('project.tags')
          tags_scope = $scope;
          if (project.id)
              mc.events.push('projects.tags.list');
          else
              $($scope).find('.loader').text(mc.i18n('table.empty'))
      }
  });