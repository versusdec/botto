define(['microcore', 'mst!layouts/components/select', 'mst!layouts/components/select_option'],
  function (mc, select_view, select_option) {
      return async (params, value, ctx) => {
          let data = params
          data.id = 'select_' + Math.round(Math.random() * 1000000)
          let val = await value()

          if (val.length > 1) {
              try {
                  data.options = JSON.parse(val)
              } catch (e) {
                  console.log(e);
              }
          }
          for (let i in data.options) {
              if (data.options[i].value === data.value) {
                  data.option = data.options[i].option
                  break;
              }
          }

          function updateOptions($select) {
              $select.find('.options li').on('click', (e) => {
                  if (!$(e.target).hasClass('disabled')) {
                      data.value = e.target.dataset.value
                      data.option = e.target.innerText

                      if ($(e.target).hasClass('selected')) {
                          return
                      }

                      $select.find('li').removeClass('selected').forEach((option) => {
                          if (option.dataset.value === data.value) {
                              $(option).addClass('selected')
                          }
                      })

                      $select.find('.option span')[0].innerText = data.option
                      $select.find('.option span')[0].dataset.value = data.value
                      $select.find('.option')[0].dataset.value = data.value
                      $select.find('.option')[0].dataset.option = data.option

                      if (typeof data.onchange == 'function') {
                          data.onchange(data)
                      } else if (typeof data.onchange == 'string') {
                          mc.events.push(data.onchange, data)
                      }
                      if (!data.method) {
                          $select.removeClass('open');
                      }
                  }
              })
          }

          let wait_load = setInterval(() => {
              let $select = $('#' + data.id)
              if ($select.length) {
                  $select[0].onchange = data.onchange
                  $select[0].addOptions = async function (options) {
                      let appendItem = (item) => {
                          if ($(this).find('.options li:first-child').length
                            && $(this).find('.options li:first-child')[0].dataset.value !== 'select') {
                              $(this).find('.options li:first-child').before(item)
                          } else if ($(this).find('.options li:first-child').length
                            && $(this).find('.options li:first-child')[0].dataset.value === 'select'
                            && $(this).find('.options li:nth-child(2)').length) {
                              $(this).find('.options li:nth-child(2)').before(item)
                          } else {
                              $(this).find('.options').append(item)
                          }
                      }

                      if (Array.isArray(options)) {
                          for (let i = 0; i < options.length; i++) {
                              let item = await select_option(options[i])
                              appendItem(item)
                          }
                      } else {
                          let item = await select_option(options)
                          appendItem(item)
                      }
                      updateOptions($(this));
                      $(this).find('li:first-child')[0].click();
                      return true
                  }
                  $select[0].removeOptions = async function (options) {
                      if (Array.isArray(options)) {
                          for (let i = 0; i < options.length; i++) {
                              $($select).find(`.options li[data-value=${options[i]}]`).remove()
                          }
                      } else {
                          $($select).find(`.options li[data-value=${options}]`).remove()
                      }
                      updateOptions($(this));
                      $(this).find('li:first-child')[0].click();
                      return true
                  }

                  clearInterval(wait_load)

                  $(document).on('click', (e) => {
                      if (!$(e.target).closest('.select')) {
                          $select.removeClass('open')
                      }
                  })

                  $select.on('click', e => {
                      $(`.select:not(#${data.id})`).removeClass('open')
                      if ($select.hasClass('open') || $(e.target).closest('ul.options')) {
                          $select.removeClass('open')
                      } else {
                          $select.addClass('open')
                      }
                  })

                  updateOptions($select);
                  $select.on('update', (e) => {
                      updateOptions($(e.target))
                  })
              }
          }, 300)

          return await select_view(data)
      }
  });