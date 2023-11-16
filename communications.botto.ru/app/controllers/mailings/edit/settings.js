define(["microcore",
      "mst!/mailings/edit/settings",
      "notify", "popup"],
  function (mc, view,
            notify,
            popup) {

      let mailing;

      mc.events.on('mailings.max_spent.change', val => {
          mailing.max_spent = +val;
      });

      mc.events.on('mailings.max_leads.change', val => {
          mailing.max_leads = +val;
      });

      mc.events.on('mailings.response_timeout.change', val => {
          if (!val.length) {
              val = 27
          }
          mailing.response_timeout = +val;
      });

      mc.events.on('mailings.action_timeout.change', val => {
          if (!val.length) {
              val = 7
          }
          mailing.action_timeout = +val;
      });

      mc.events.on('mailings.records.change', val => {
          mailing.records = val;
      });

      mc.events.on('mailings.amd.change', val => {
          mailing.amd = val;
      });

      return async function ($scope, $params) {
          mailing = mc.storage.get('mailing');


          let data = {
              id: $params.id ? $params.id : 'new',
              mailing: mailing,
              speed_change: function (data) {
                  mailing.speed = data.value
              },
              last: true
          }

          $($scope).html(await view(data))
      }

  });