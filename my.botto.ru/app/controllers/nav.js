define(['microcore'], function (mc) {
    let nav = $('body > nav')
    let a = nav.find('li a');
    a.on('click', (e) => {
        if (!!!e.target.attributes.href) {
            $(e.target.nextElementSibling).toggleClass('active')
        }
        $('nav').removeClass('opened')
    })

    function update() {
        let parts = location.pathname.split("/");
        parts = (require.config.comm_sub_domain == location.hostname || require.config.leads_sub_domain == location.hostname) ? parts[2] : parts[1]
        a.removeClass('active');
        if (parts.length) {
            let link = false;
            a.forEach(item => {
                if ($(item).attr('href') && $(item).attr('href').includes(parts)) {
                    if (!link) {
                        link = item;
                    } else {
                        let parts = location.pathname.split("/")[3];
                        if ($(item).attr('href') && $(item).attr('href').includes(parts)) {
                            link = item;
                        }
                    }
                }
            });
            if (link) {
                $(link).addClass('active');
                if ($(link).closest('.submenu')) {
                    $(link).closest('.submenu').find('ul').addClass('active')
                    $(link).closest('.submenu').find('a')[0].classList.add('active')
                }
            } else {

            }
        } else {
            let link = `li a[href="/"]`;
            if ([require.config.comm_sub_domain].includes(location.host) || [require.config.leads_sub_domain].includes(location.host)) {
                link = `li a[href="/${mc.storage.get('project_id')}/"]`
            }
            nav.find(link).addClass('active');
        }
    }

    mc.events.on('routeChange', update)

    return async ($scope, $params) => {
        update();
    }
});