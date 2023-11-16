define(["microcore", "mst!/support/ticket/index", "/app/modules/notify"],
  function (mc, view, notify) {

      let id;
      let data = {};

      function field_error(field, tab) {
          // $('ul.tabs li a')[tab].click();
          $(field).addClass('error');
          setTimeout(() => {
              $(field).removeClass('error')
          }, 3000);
          return false
      }

      mc.events.on("answer.add", (btn) => {
          if (!$('[name=text]').val().length) {
              return field_error('[name=text]')
          } else {
              btn.setAttribute('disabled', true)
              data.text = $('[name=text]').val();
              console.log(data);
              mc.api.call('support.answer', data).then((res) => {
                  if (res) {
                      mc.router.go(location.pathname)
                  } else {
                      btn.removeAttribute('disabled')
                      notify(mc.i18n('system.error'))
                  }
              })
          }
      });

      mc.events.on("answer.upload", (files) => {
          data.attachments = [];
          files.forEach(e => {
              data.attachments.push({
                  type: e.type,
                  data: {
                      path: e.path,
                      name: e.name
                  }
              })
          });
      });

      return async function (params) {
          document.title = `${mc.i18n('support.title')} | Botto Platform`;
          data.id = parseInt(params.id);
          let ticket = await mc.api.call('support.get', {id: data.id}).then(res => res);
          if (!ticket) {
              return mc.router.go(`/404`)
          }
          return view(ticket);
      }
  });