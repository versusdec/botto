define(['microcore', 'mst!layouts/components/progress'],
  function (mc, progress_view) {
      return async (params) => {
          let data = params
          data.id = 'progress_' + Math.round(Math.random() * 1000000)
          if (+data.current && +data.total) {
              data.progress = (+data.current / +data.total * 100).toFixed()
          } else {
              data.progress = 0
          }
          if (data.progress > 100)
              data.progress = 100;
          let wait_load = setInterval(() => {
              let progress = $('#' + data.id)
              if (progress.length) {
                  clearInterval(wait_load)
                  progress.find('span').css('width', `${data.progress}%`)
              }
          }, 300)

          return await progress_view(data)
      }
  });