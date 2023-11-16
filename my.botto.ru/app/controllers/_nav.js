define(['microcore'], function (mc) {
    let nav = $('body > nav')
    let a = nav.find('li a');
    a.on('click', () => {
        $('nav').removeClass('opened')
    })

    function update() {
        let parts = window.location.pathname.split("/")[1];
        a.removeClass('active');
        if (parts.length) {
            let link = false;
            a.forEach(item => {
                if ($(item).attr('href') && $(item).attr('href').includes(parts)) {
                    link = item
                }
            });
            if (link) {
                $(link).addClass('active');
            }
        } else {
            nav.find('li a[href="/"]').addClass('active');
        }
    }

    mc.events.on('routeChange', update)

    return async ($scope, $params) => {
        update()
    }
});