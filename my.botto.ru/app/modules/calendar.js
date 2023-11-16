define(['microcore', 'mst!layouts/components/calendar'], function (mc, calendar_view) {
    function leapYear(year) { return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0); }

    async function update (date, id) {
        let months = [
            {name: mc.i18n('calendar.months.january')  , days: 31},
            {name: mc.i18n('calendar.months.february') , days: 28},
            {name: mc.i18n('calendar.months.march')    , days: 31},
            {name: mc.i18n('calendar.months.april')    , days: 30},
            {name: mc.i18n('calendar.months.may')      , days: 31},
            {name: mc.i18n('calendar.months.june')     , days: 30},
            {name: mc.i18n('calendar.months.july')     , days: 31},
            {name: mc.i18n('calendar.months.august')   , days: 31},
            {name: mc.i18n('calendar.months.september'), days: 30},
            {name: mc.i18n('calendar.months.october')  , days: 31},
            {name: mc.i18n('calendar.months.november') , days: 30},
            {name: mc.i18n('calendar.months.december') , days: 31}
        ]

        let data = {
            id: id,
            years: [],
            months: [],
            days: []
        }

        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()

        for (let i = year-1; i <= year+1; i++) {
            data.years.push({year: i, selected: i === year})
        }

        for (let i = month-1; i <= month+1; i++) {
            if (i < 0) {
                data.months.push({ordinal: 12-i,month: months[12+i].name, selected: i === month})
            } else if (i > 11) {
                data.months.push({ordinal: i-12,month: months[i-12].name, selected: i === month})
            } else {
                data.months.push({ordinal: i,month: months[i].name, selected: i === month})
            }
        }

        let start_date = new Date()
        start_date.setFullYear(year)
        start_date.setMonth(month)
        start_date.setDate(1)
        let shift = start_date.getDay()-1

        if (shift<0) {
            shift = 6
        }

        if (month === 1 && leapYear(year)) {
            months[month].days = 29
        } else if (month === 1) {
            months[month].days = 28
        }

        for (let i = 1; i <= months[month].days + shift; i++) {
            if (i>shift) {
                data.days.push({day: i-shift, selected: i-shift === day})
            } else {
                data.days.push({})
            }
        }

        $('#' + data.id).html($(await calendar_view(data))[0].firstChild.innerHTML)
    }

    return async (params) => {
        let data = params
        data.id = 'calendar_' + Math.round(Math.random()*1000000)

        if (data.date && data.date.match(/\d{1,2}\.\d{1,2}\.\d{4}/)) {
            data.date = data.date.split('.')
            data.date = new Date(data.date[2],data.date[1]-1,data.date[0])
        } else if (!(data.date instanceof Date)) {
            data.date = new Date()
        }

        let wait_load = setInterval(() => {
            let $calendar = $('#' + data.id)
            if ($calendar.length) {
                update(data.date, data.id)
                clearInterval(wait_load)

                $calendar.on('dblclick', (e) => {
                    let $el = $(e.target)
                    if (e.target.nodeName == 'LI' && $el.closest('ul').hasClass('days')) {
                        data.date.setDate($el[0].innerText)
                        update(data.date, data.id)
                        data.onchange(data.date)
                    }
                })
                  .on('click', (e) => {
                    let $el = $(e.target);
                      if (e.target.nodeName == 'LI' && !$el.hasClass('selected')) {
                        if ($el.closest('ul').hasClass('years')) {
                            data.date.setFullYear($el[0].innerText)
                            update(data.date, data.id)
                        } else if ($el.closest('ul').hasClass('months')) {
                            data.date.setMonth($el[0].dataset.month)
                            update(data.date, data.id)
                        } else if ($el.closest('ul').hasClass('days')) {
                            data.date.setDate($el[0].innerText)
                            update(data.date, data.id)
                            data.onchange(data.date)
                        }
                    }

                    if (e.target.nodeName == 'BUTTON') {
                        data.onchange(data.date)
                    }
                }).on('setDate', function (e) {
                    data.date = e.detail;
                    update(data.date, data.id)
                })
            }
        }, 300)

        return await calendar_view(data)
    }
});