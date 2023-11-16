define(['microcore', 'mst!mailings/list/voice/item', "confirm", "notify"],
  function (mc, voice_item_view, confirm, notify) {

      let filter = {
          project_id: mc.storage.get('project_id')
      }, page, scope, params;

      function filterReset() {
          mc.storage.unset('mailings.filter');
          let hash = mc.router.hash();
          filter = {
              project_id: mc.storage.get('project_id'),
              limit: parseInt(hash.limit) || 10,
          }
          mc.router.go(location.pathname)
      }

      mc.events.on('ws:communications.mailings.update', async (data) => {
          if (data.state === 'running') {
              mc.storage.get('mailing_list').find(x => {
                  if (x.id === data.id && x.state !== 'running') {
                      return mc.events.push('mailings.list')
                  }
              })
          } else {
              if (data.state === 'ended') {
                  mc.storage.get('mailing_list').find(x => {
                      if (x.id === data.id && x.state !== 'ended') {
                          x.state = data.state
                          notify(mc.i18n('mailings.ended'), `ID: ${data.id}`)
                      }
                  })
              }
              let table = $('#mailing-list');
              if (table && table.find(`[data-id="${data.id}"]`).length) {
                  let row = table.find(`[data-id="${data.id}"]`);
                  data.stats.ppl = +data.stats.ppl;
                  data.stats.ppl = parseInt(data.stats.ppl).toFixed(2);

                  $(row).html(await voice_item_view(data));
              }
          }
      })

      mc.events.on('mailings.speed.change', (data) => {
          mc.api.call('communications.mailings.update', {
              project_id: mc.storage.get('project_id'),
              id: data.mailing,
              speed: data.value
          })
            .then(res => {
                if (res) {
                    notify(mc.i18n('mailings.speed_changed'))
                } else
                    notify(mc.i18n('system.error'))
            })
      })

      mc.events.on('mailings.pause', (id) => {
          confirm(mc.i18n('mailings.confirm_pause'), '', () => {
              mc.api.call('communications.mailings.pause', {
                  project_id: mc.storage.get('project_id'),
                  id: +id
              }).then(res => {
                  if (res) {
                      notify(mc.i18n('mailings.paused'))
                      // mc.router.go(location.pathname)
                  } else
                      notify(mc.i18n('system.error'))
              })
          })
      })

      mc.events.on('mailings.start', (id) => {
          confirm(mc.i18n('mailings.confirm_start'), '', () => {
              mc.api.call('communications.mailings.start', {
                  project_id: mc.storage.get('project_id'),
                  id: +id
              }).then(res => {
                  if (res) {
                      notify(mc.i18n('mailings.started'))
                      // mc.router.go(location.pathname)
                  } else
                      notify(mc.i18n('system.error'))
              })
          })
      })

      mc.events.on('mailings.restart', (id) => {
          confirm(mc.i18n('mailings.confirm_restart'), '', () => {
              mc.api.call('communications.mailings.restart', {
                  project_id: mc.storage.get('project_id'),
                  id: +id
              }).then(res => {
                  if (res) {
                      notify(mc.i18n('mailings.restarted'))
                      // mc.router.go(location.pathname)
                  } else
                      notify(mc.i18n('system.error'))
              })
          })
      })

      mc.events.on('mailings.stop', (id) => {
          confirm(mc.i18n('mailings.confirm_stop'), '', () => {
              mc.api.call('communications.mailings.stop', {
                  project_id: mc.storage.get('project_id'),
                  id: +id
              }).then(res => {
                  if (res) {
                      notify(mc.i18n('mailings.stopped'))
                      // mc.router.go(location.pathname)
                  } else
                      notify(mc.i18n('system.error'))
              })
          })
      })

      mc.events.on('mailings.archive', (id) => {
          confirm(mc.i18n('mailings.confirm_archive'), '', () => {
              mc.api.call('communications.mailings.update', {
                  id: +id,
                  project_id: mc.storage.get('project_id'),
                  status: 'archived'
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n('mailings.archived'));
                        mc.router.go(location.pathname)
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('mailings.unzip', (id) => {
          confirm(mc.i18n('mailings.confirm_unzip'), '', () => {
              mc.api.call('communications.mailings.update', {
                  id: +id,
                  project_id: mc.storage.get('project_id'),
                  status: 'active'
              })
                .then(res => {
                    if (res) {
                        notify(mc.i18n('mailings.unzipped'));
                        mc.router.go(location.pathname)
                    } else
                        notify(mc.i18n('system.error'))
                })
          })
      });

      mc.events.on('mailings.checkbox.change', () => {
          if ($('tbody input[type=checkbox]:checked').length) {
              $('#checkbox_buttons').removeClass('hide')
          } else {
              $('#checkbox_buttons').addClass('hide')
          }
      });

      mc.events.on('mailings.list.check.all', (checkbox) => {
          if (checkbox.checked) {
              $('tbody input[type=checkbox]').forEach(box => {
                  box.checked = true;
              })
          } else {
              $('tbody input[type=checkbox]').forEach(box => {
                  box.checked = false;
              })
          }
          mc.events.push('mailings.checkbox.change')
      });

      mc.events.on('mailings.list.stop', async () => {
          for (let i = 0; i < $('input[name=mailing]:checked').length; i++) {
              await mc.api.call('communications.mailings.stop', {
                  project_id: mc.storage.get('project_id'),
                  id: +$('input[name=mailing]:checked')[i].value
              })
          }
          mc.router.go(location.pathname)
          /*confirm(mc.i18n('phones.release') + '?', '', () => {

          })*/
      });

      mc.events.on('mailings.list.archive', async () => {
          for (let i = 0; i < $('input[name=mailing]:checked').length; i++) {
              await mc.api.call('communications.mailings.update', {
                  project_id: mc.storage.get('project_id'),
                  id: +$('input[name=mailing]:checked')[i].value,
                  status: 'archived'
              })
          }
          mc.router.go(location.pathname)
          /*confirm(mc.i18n('phones.release') + '?', '', () => {

          })*/
      });

      mc.events.on('mailings.filter.range.change', async (picker) => {
          filter[picker.name] = `${picker.value.getFullYear()}.${(picker.value.getMonth() + 1) < 10 ? '0' + (picker.value.getMonth() + 1)
            : picker.value.getMonth() + 1}.${picker.value.getDate() < 10 ? '0' + picker.value.getDate() : picker.value.getDate()
          } ${picker.name === 'period_start' ? '00:00:00' : '23:59:59'}`
      })

      mc.events.on('mailings.filter.name.change', async (val) => {
          filter.name = val;
      })

      mc.events.on('mailings.filter.state.change', async () => {
          filter.state = [];
          $('input[type=checkbox]:checked').forEach(i=>{
              filter.state.push($(i).attr('name'))
          })
      })

      mc.events.on('mailings.filter', async () => {
          mc.storage.set('mailings.filter', filter)
          mc.router.go(location.pathname)
          // mc.events.push('detailing.list')
      })

      mc.events.on('mailings.filter.reset', async () => {
          filterReset();
      })

      mc.events.on('mailings.list', async () => {
          let hash_params = mc.router.hash();
          page = parseInt(hash_params.page) || 1;
          filter.limit = parseInt(hash_params.limit) || 10;
          filter.offset = (page - 1) * filter.limit;
          console.log(filter)
          if (params.tab === 'active') {
              filter.status = 'active';
              if (!filter.state || !filter.state?.length)
                  filter.state = ['running', 'paused', 'ended', 'stopped']
              // filter.limit = parseInt(hash_params.limit) || 50;
          }
          if (params.tab === 'ended') {
              filter.status = 'active';
              filter.state = ['ended', 'stopped']
              // filter.limit = parseInt(hash_params.limit) || 50;
          }
          if (params.tab === 'archived') {
              filter.status = 'archived';
          }

          let response = await mc.api.call(`communications.mailings.list`, filter);

          if (response && response.items && response.items.length) {
              mc.storage.set('mailing_list', response.items)
              $(scope).find('tbody').html('');

              let items = response.items;

              if (params.tab === 'active') {
                  let running_items = [];
                  items = [];
                  response.items.sort((a, b) => {
                      return (b.id - a.id);
                  })
                  // if (params.tab === 'active') {
                  let i = 0;
                  while (i < response.items.length) {
                      if (response.items[i].state === 'running') {
                          running_items.push(response.items[i])
                      } else {
                          items.push(response.items[i])
                      }
                      i++
                  }
                  /*} else {
                      items = response.items;
                  }*/
                  items = running_items.concat(items)
              }
              for (let i in items) {
                  let item = items[i];
                  //   item.reason = 'max_spent'

                  item.stats.ppl = item.stats.ppl.toFixed(2)
                  $(scope).find('tbody').append(`<tr data-id="${item.id}">${await voice_item_view(item)}</tr>`)
              }
              console.log(response);
              mc.events.push('system:pagination.update', {
                  id: 'mailings',
                  total: response.total,
                  limit: response.limit,
                  current: filter.offset / filter.limit + 1
              })

          } else {
              $(scope).find('.loader').html(mc.i18n('table.empty'))
          }

      })


      return async ($scope, $params) => {
          scope = $scope;
          params = $params;
          mc.events.push('mailings.list')

      }
  });