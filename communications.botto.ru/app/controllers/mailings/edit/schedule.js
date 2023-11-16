define(["microcore",
      "mst!/mailings/edit/schedule",
      "mst!/mailings/edit/schedule/hours",
      "mst!/mailings/edit/schedule/weekday",
      "notify", "popup"],
  function (mc, view, hour_view, day_view,
            notify,
            popup) {

      let mailing;

      function setPreset({days, start, end}) {
          mailing.schedule = []
          $('[data-day]').forEach(day => {
              if (+day.dataset.day === days[0]) {
                  for (let i = start; i <= end; i++) {
                      $(day).find(`[data-hour="${i}"] [name=hour]`)[0].checked = true;

                      mailing.schedule.push(setData($(day).find(`[data-hour="${i}"] [name=hour]`)))
                  }
                  days.shift();
              }
          })
      }

      function setData(item) {
          const weekday = $(item).closest('[data-day]')[0];
          const hour = $(item).closest('[data-hour]')[0];
          return {
              weekday: +weekday.dataset.day === 7 ? 0 : +weekday.dataset.day,
              /*speed: +$(hour).find('[name=speed]').val(),
              max_spent: +$(hour).find('[name=max_spent]').val(),
              leads: +$(hour).find('[name=leads]').val(),*/
              hour: +hour.dataset.hour,
          }
      }

      mc.events.on('mailings.schedule.preset.change', select => {
          $('input[name=hour]').forEach(input => {
              input.checked = false
          });
          switch (select.value) {
              case 'weekdays_9_18':
                  setPreset({days: [1, 2, 3, 4, 5], start: 9, end: 18});
                  break;
              case 'weekdays_12_17':
                  setPreset({days: [1, 2, 3, 4, 5], start: 12, end: 17});
                  break;
              case 'weekend_9_17':
                  setPreset({days: [6, 7], start: 9, end: 17});
                  break;

              default:
                  return;
          }
      });

      mc.events.on('mailings.schedule.day.change', input => {
          let data = setData(input)
          if (input.checked) {
              mailing.schedule.push(data)
          } else {
              mailing.schedule.find((item, i) => {
                  if (item.weekday === data.weekday && item.hour === data.hour) {
                      mailing.schedule.splice(i, 1)
                      return true
                  }
              })
          }
      })

      mc.events.on('mailings.schedule.day.settings.change', input => {
          if(typeof input === 'object'){
              input = $(`#${input.id}`)
          }
          if ($(input).closest('td').find('[name=hour]')[0].checked) {
              const data = setData(input)
              mailing.schedule.find((item, i) => {
                  if (item.weekday === data.weekday && item.hour === data.hour) {
                      mailing.schedule[i] = data
                      return true
                  }
              })
          }
      })


      return async function ($scope, $params) {
          mailing = mc.storage.get('mailing');
          let data = {
              id: $params.id ? $params.id : 'new',
              mailing: mailing,
              time_zones: [
                  {
                      option: 'GMT+3 Москва',
                      value: ''
                  }
              ],
              presets: [
                  {
                      option: 'По будням с 9:00 до 18:00',
                      value: 'weekdays_9_18'
                  },
                  {
                      option: 'По будням с 12:00 до 17:00',
                      value: 'weekdays_12_17'
                  },
                  {
                      option: 'Выходные с 9:00 до 17:00',
                      value: 'weekend_9_17'
                  }
              ],
              weekdays: []
          }
          let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
          for (let i = 0; i < 7; i++) {
              let hours = [];
              for (let j = 7; j <= 21; j++) {
                  let h_data = {
                      hour: j,
                      speed: 25000,
                      max_spent: 0,
                      leads: 0,
                      weekday: days[i]
                  }
                  hours.push(h_data)
              }
              data.weekdays.push({weekday: i + 1, hours: hours, title: mc.i18n(`calendar.weekdays_full.${days[i]}`)})
          }

          if (mailing.schedule.length) {
              mailing.schedule.forEach(day => {
                  data.weekdays.find((item, i) => {
                      if (item.weekday === (day.weekday === 0 ? 7 : day.weekday)) {
                          item.hours.find((hour, j)=>{
                              if(hour.hour === day.hour){
                                  data.weekdays[i].hours[j] = {
                                      ...day,
                                      weekday: days[day.weekday === 0 ? 6 : day.weekday - 1],
                                      checked: true
                                  }
                                  return true
                              }
                          })
                          return true
                      }
                  })
              })
          }

          $($scope).html(await view(data))
      }

  });