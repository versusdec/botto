define(["microcore", "mst!/pixel/edit/edit", "disclaimer", "scripts"],
  function (mc, view, dis, scripts) {

      mc.events.on('pixel.disclaimer.example', () => {
          dis(
            'Продолжая пользоваться сайтом Вы принимаете <b>условия пользования</b> сайтом ' +
            'и <a class="link hover">Политику конфиденциальности</a>'
          )
      })

      return async function (params) {
          document.title = `${mc.i18n('pixel.edit.title')} | Botto Platform`;
          let data = await mc.api.call('communications.pixel.get', {
              project_id: mc.storage.get('project_id'),
              id: +params.id
          }).then(async res => {
              if (res)
                  return res
              else
                  return {}
          })
          return view(data);
      }
  }
);