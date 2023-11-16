/*
self.addEventListener('install', (event) => {

});

self.addEventListener('activate', (event) => {

});

function messageEvent(event) {
    let data = JSON.parse(event.data)

    if (data.user.id) {
        let server = new WebSocket(`wss://api.botto.ai/ws/`,'client');

        server.onopen = function () {
            server.send(JSON.stringify({
                id: data.user.id,
                mess_id: data.mess_id || 0,
                type: 'init'
            }));
        }

        server.onmessage = (sock_ev)  => {
            let sock_data = JSON.parse(sock_ev.data);
            if (sock_data.type == 'event') {
                server.mess_id = data.mess_id
                event.source.postMessage(sock_ev.data)
            } else if (sock_data.type == 'ping') {
                server.send(JSON.stringify({
                    id: data.user.id,
                    type: "pong"
                }));
            }
        }

        server.onclose = (sock_ev)  => {
            messageEvent(event)
        }

        server.onerror = (sock_ev)  => {
            console.log('WS ERROR')
            console.log(sock_ev)
        }
    }
}

addEventListener('message', event => {
    messageEvent(event)
});

addEventListener('fetch', (event) => {
    if (event.request.method !== 'POST') {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                        if (response) {
                            return response;
                        }
                        return fetch(event.request);
                    }
                )
        );
    }
});

addEventListener('push', (event) => {


    // TODO
    // var title = 'Yay a message.';
    // var body = 'We have received a push message.';
    // var icon = '/images/icon-192x192.png';
    // var tag = 'simple-push-demo-notification-tag';

    // event.waitUntil(
    //   self.registration.showNotification(title, {
    //     body: body,
    //     icon: icon,
    //     tag: tag
    //   })
    // );
});

addEventListener('notificationclick', (event) => {


    // TODO
    // Android doesn't close the notification when you click on it
    // See: http://crbug.com/463146
    // event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    // event.waitUntil(
    //   clients.matchAll({
    //     type: "window"
    //   })
    //   .then(function(clientList) {
    //     for (var i = 0; i < clientList.length; i++) {
    //       var client = clientList[i];
    //       if (client.url == '/' && 'focus' in client)
    //         return client.focus();
    //     }
    //     if (clients.openWindow) {
    //       return clients.openWindow('/');
    //     }
    //   })
    // );
});*/
