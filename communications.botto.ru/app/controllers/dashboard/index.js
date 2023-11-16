define(
  ["microcore",
      "mst!/dashboard/index",
      "notify",
      "popup",
      "chart"
  ],
  function (mc, view, notify, popup, Chart) {

      let filter = {
          period_start: mc.i18n('filter.period_start'),
          period_end: mc.i18n('filter.period_end'),
          range: {}
      }, spent_config, price_config, leads_config, period;

      function getPeriod(startDate, stopDate) {
          let data = [];
          let currentDate = startDate;

          while (currentDate >= stopDate) {
              let day = new Date(currentDate);
              let y = day.getFullYear(), m = day.getMonth() + 1, d = day.getDate();
              let date = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
              data.push(date);
              let nextDay = currentDate.getDate() - 1;
              currentDate.setDate(nextDay);
          }

          //
          return data
      }

      function getMonth() {
          let data = [];
          for (let i = 0; i < 30; i++) {
              let today = new Date();
              let day = today.getDate() - i;
              today.setDate(day)

              let y = today.getFullYear(), m = today.getMonth() + 1, d = today.getDate();

              let date = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
              let _date = (d < 10 ? "0" + d : d) + "-" + (m < 10 ? "0" + m : m) + "-" + y;

              data.push(date)
          }
          return data
      }

      mc.events.on('dashboard.filter.range.start', (picker) => {
          filter.range.start = picker.value
      })

      mc.events.on('dashboard.filter.range.end', (picker) => {
          filter.range.end = picker.value
      })

      mc.events.on('charts.change', () => {
          $('.charts').toggleClass('hide')
      })

      mc.events.on('sys:page.init:dashboard/index', () => {
          const chart_all = new Chart(document.getElementById('all'), {
              data: {
                  labels: period,
                  datasets: [
                      {
                          type: 'bar',
                          yAxisID: 'A',
                          label: mc.i18n('dashboard.intensive.spent'),
                          data: spent_config.data.datasets[0].data,
                          // data: [1000,0,1,3,4,5,1],
                          borderColor: 'rgba(38, 172, 235, 0.6)',
                          backgroundColor: 'rgba(38, 172, 235, 0.6)',
                          tension: 0.5
                      },
                      {
                          type: 'bar',
                          yAxisID: 'B',
                          label: mc.i18n('dashboard.intensive.price'),
                          data: price_config.data.datasets[0].data,
                          // data: [100,0,1,3,4,5,1],
                          borderColor: 'rgba(250, 0, 108, 0.6)',
                          backgroundColor: 'rgba(250, 0, 108, 0.6)',
                          tension: 0.5
                      },
                      {
                          type: 'bar',
                          yAxisID: 'C',
                          label: mc.i18n('dashboard.intensive.leads'),
                          data: leads_config.data.datasets[0].data,
                          // data: [10,0,1,3,4,5,1],
                          borderColor: 'rgba(39, 174, 96, 0.6)',
                          backgroundColor: 'rgba(39, 174, 96, 0.6)',
                          tension: 0.5
                      }
                  ]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                      intersect: false,
                      mode: 'index',
                  },
                  scales: {
                      yAxes: [
                          {
                              id: 'A'
                          }, {
                              id: 'B',
                          }, {
                              id: 'C',
                          }
                      ]
                  }
              },
          });
          const spent = new Chart(document.getElementById('spent'), spent_config)
          const price = new Chart(document.getElementById('price'), price_config)
          const leads = new Chart(document.getElementById('leads'), leads_config)
      })

      return async function (params) {
          document.title = `${mc.i18n('dashboard.title')} | Botto Platform`;
          let date;
          let [project, stats] = await mc.api.batch({
              method: 'projects.get',
              params: {
                  id: mc.storage.get('project_id')
              }
          }, {
              method: 'communications.stats',
              params: {
                  project_id: mc.storage.get('project_id')
              }
          })

          try {
              let range = mc.storage.get('dashboard.date.range');
              if (range) {
                  let fd = new Date(range[0]);
                  let ld = new Date(range[1]);
                  let fdy = fd.getFullYear(), fdm = fd.getMonth() + 1, fdd = fd.getDate();
                  let ldy = ld.getFullYear(), ldm = ld.getMonth() + 1, ldd = ld.getDate();
                  date = fdy + "-" + (fdm < 10 ? "0" + fdm : fdm) + "-" + (fdd < 10 ? "0" + fdd : fdd) + " — " + ldy + "-" + (ldm < 10 ? "0" + ldm : ldm) + "-" + (ldd < 10 ? "0" + ldd : ldd);

                  //
                  // date = params.date;
                  period = getPeriod(range[1], range[0])

              } else {
                  let today = new Date(), y = today.getFullYear(), m = today.getMonth() + 1, d = today.getDate();
                  date = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
                  //

                  period = getMonth();
              }
          } catch (e) {
          }
          let conversion = (stats.leads / stats.answered * 100).toFixed(2);

          if (conversion > 0) {
              stats.conversion = conversion
          } else {
              stats.conversion = 0;
          }
          if (stats.calls > 0 && stats.answered > 0) {
              stats.deliverability = (stats.answered / stats.calls * 100).toFixed(2)
          } else {
              stats.deliverability = 0;
          }

          let spent_data = {
              labels: period,
              datasets: [
                  {
                      data: [],
                      borderColor: 'rgba(38, 172, 235, 0.6)',
                      backgroundColor: 'rgba(38, 172, 235, 0.6)',
                      tension: 0.3
                  }
              ]
          };

          let price_data = {
              labels: period,
              datasets: [
                  {
                      data: [],
                      borderColor: 'rgba(250, 0, 108, 0.6)',
                      backgroundColor: 'rgba(250, 0, 108, 0.6)',
                      tension: 0.3
                  }
              ]
          };

          let leads_data = {
              labels: period,
              datasets: [
                  {
                      data: [],
                      borderColor: 'rgba(39, 174, 96, 0.6)',
                      backgroundColor: 'rgba(39, 174, 96, 0.6)',
                      tension: 0.3
                  }
              ]
          };

          period.forEach(item => {
              let day = stats.days && stats.days.find(x => x.date === item);
              if (day) {
                  spent_data.datasets[0].data.push(day.spent)
                  price_data.datasets[0].data.push(day.ppl.toFixed(2))
                  leads_data.datasets[0].data.push(day.leads)
              } else {
                  spent_data.datasets[0].data.push(0)
                  price_data.datasets[0].data.push(0)
                  leads_data.datasets[0].data.push(0)
              }
          })

          spent_config = {
              type: 'bar',
              data: spent_data,
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: {
                          display: false,
                      },
                      title: {
                          display: false,
                          text: mc.i18n('dashboard.intensive.spent')
                      }
                  }
              },
          };

          price_config = {
              type: 'bar',
              data: price_data,
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: {
                          display: false,
                      },
                      title: {
                          display: false,
                          text: mc.i18n('dashboard.intensive.price')
                      }
                  }
              },
          };

          leads_config = {
              type: 'bar',
              data: leads_data,
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: {
                          display: false,
                      },
                      title: {
                          display: false,
                          text: mc.i18n('dashboard.intensive.leads')
                      }
                  }
              },
          };
          if (!project) {
              return mc.router.go(`/${mc.storage.get('project_id')}/404`)
          }
          return view({
              title: project.name,
              filter: filter,
              stats: stats
          });

      }
  });