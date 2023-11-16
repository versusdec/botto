define(['microcore', 'mst!layouts/components/dropzone', 'notify'],
  function (mc, dropzone_view, notify) {
      mc.events.on('sys:file.upload', async (data) => {
          let files = new FormData();
          let upload = false;
          $(data.files).forEach((file) => {
              if ($(data.dropzone).accept) {
                  var accept = $(data.dropzone).accept.split(',')
              }
              if (accept) {
                  let ext = '.' + file.name.split('.')[file.name.split('.').length - 1]
                  if (accept.find(x => x === ext)) {
                      files.append('file', file)
                      upload = true
                  } else {
                      notify(mc.i18n('system.wrong_format'))
                      return false
                  }
              } else if (!accept) {
                  files.append('file', file)
                  upload = true
              } else {
                  return false
              }
          })

          if (upload) {
              $(data.dropzone).find('.loader').removeClass('hide')
              let uploaded;
              try {
                  uploaded = await fetch(`${require.config.api}/upload`, {
                      method: 'POST',
                      body: files
                  }).then(async res => {
                      let resp = await res;
                      $(data.dropzone).find('.loader').addClass('hide')
                      return resp.json()
                  });
              } catch (e) {
                  $(data.dropzone).find('.loader').addClass('hide');
                  return notify(mc.i18n('system.error'))
              }
              let info = []

              $(uploaded).each((i, file) => {
                  if (typeof file == 'object') {
                      info.push(file.name)
                  }
              })

              $(data.dropzone).find('span span').text(info.join(', '))
              if (typeof $(data.dropzone).onupload == 'function') {
                  $(data.dropzone).onupload(uploaded)
              } else if (typeof $(data.dropzone).onupload == 'string') {
                  mc.events.push($(data.dropzone).onupload, uploaded)
              }
          }
      })

      return async (params) => {
          let id = 'dropzone_' + Math.round(Math.random() * 1000000)
          let data = {id: id, accept: params.accept};

          if (params.multiple) {
              data.multiple = 'multiple'
          }

          let wait_load = setInterval(() => {
              let $dropzone = $('#' + id)
              if ($dropzone.length) {
                  clearInterval(wait_load)
              }

              $dropzone.on('dragover', () => {
                  $dropzone.addClass('over')
              })

              $dropzone.on('dragleave', () => {
                  $dropzone.removeClass('over')
              })

              $dropzone.on('drop', () => {
                  $dropzone.removeClass('over')
              })

              $dropzone.__proto__.onupload = params.onupload
              if (params.accept) {
                  $dropzone.__proto__.accept = params.accept
              } else {
                  $dropzone.__proto__.accept = false;
              }

          }, 300)
          return await dropzone_view(data)
      }
  });