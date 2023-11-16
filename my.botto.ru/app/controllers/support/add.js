define(["microcore", "mst!/support/add", "/app/modules/notify"],
  function (mc, view, notify) {

    let data = {};

    function field_error(field, tab) {
      // $('ul.tabs li a')[tab].click();
      $(field).addClass('error');
      setTimeout(() => {
        $(field).removeClass('error')
      }, 3000);
      return false
    }

    mc.events.on("ticket.add", (btn) => {
      if (!$('.select > .option > span').html().length) {
        return field_error('.select')
      } else if (!$('[name=name]').val().length) {
        return field_error('[name=name]')
      } else if (!$('[name=text]').val().length) {
        return field_error('[name=text]')
      } else {
        btn.setAttribute('disabled', true)
        data.name = $('[name=name]').val();
        data.text = $('[name=text]').val();
        mc.api.call('support.create', data).then((res) => {
          if (res) {
            mc.router.go(`/support/ticket/${res}`)
          } else {
            notify(mc.i18n('system.error'))
            btn.removeAttribute('disabled')

          }
        })
      }
    });

    mc.events.on("ticket.upload", (files) => {
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
      const stats = await mc.api.call('support.stats');
      if (stats) {
        stats.common = stats.common / 60;
        stats.my_tickets = stats.my_tickets / 60;
      }

      return view({
        stats: stats,
        options: [
          {
            option: mc.i18n('support.type.tech'),
            value: 'tech'
          },
          {
            option: mc.i18n('support.type.finance'),
            value: 'finance'
          }
        ],
        onchange: (selected) => {
          data.theme = selected.value
        }
      });
    }
  });