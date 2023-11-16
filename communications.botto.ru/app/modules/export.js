define(['microcore', 'scripts', "notify"],
  function (mc, scripts, notify) {

      let exportFn = (method, params, btn) => {
          btn.setAttribute('disabled', true)
          $('main > header').addClass('loading');
          mc.api.call(method, params).then(async response => {
              return response.blob().then((data) => {
                  return {
                      data: data,
                      filename: response.headers.get('content-disposition').split('=')[1],
                  };
              });
          }).then(({data, filename}) => {
                const downloadUrl = URL.createObjectURL(data);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                $(document.body).find(a).remove();
                btn.removeAttribute('disabled');
                $('main > header').removeClass('loading');
            });
      }

      mc.events.on('bases.contacts.export', async ({type, id, btn}) => {
          exportFn(`communications.${type}.contacts.export`, {
              project_id: mc.storage.get('project_id'),
              id: +id
          }, btn)
      })

      mc.events.on('mailings.analytics.export', ({type, id, btn}) => {
          let params = {
              project_id: mc.storage.get('project_id'),
              id: +id,
              type: type
          }

          exportFn('communications.mailings.export', params, btn)
      })
  });