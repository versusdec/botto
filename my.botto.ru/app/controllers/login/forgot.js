define(["microcore", "mst!/login/forgot", "/app/modules/notify"], function (mc, view, notify) {

  function setTimer() {
    let now = new Date();
    let exp = new Date(JSON.parse(localStorage.getItem('recover.timeout')));
    let btn = $('button');
    if (exp && exp > now) {
      btn[0].disabled = true;
      let timeout = parseInt((exp - now) / 1000);
      let m = parseInt(timeout / 60);
      let s = timeout % 60;
      let x = setInterval(function () {
        s < 10 ? m < 10 ? btn.html('0' + m + ':0' + s) :
          btn.html('0' + m + ':0' + s) :
          m < 10 ? btn.html('0' + m + ':' + s) :
            btn.html(m + ':' + s);
        s--;
        if (s === -1 && m !== 0) {
          s = 59;
          m--
        } else if(s === -1 && m === 0){
          clearInterval(x);
          mc.router.go(location.pathname)
        }
        if (s === 0 && m !== 0) {
          s = 59;
          m--;
        }

       /* if (m === 0 && s === -1) {
          clearInterval(x);
          mc.router.go(location.pathname)
        }*/
      }, 1000);

    } else {
      btn[0].disabled = false;

    }
  }

  function setExpDate() {
    let now = new Date();
    let exp = new Date();
    exp.setTime(now.getTime() + (3 * 60000));
    localStorage.setItem('recover.timeout', JSON.stringify(exp.getTime()));
  }

  mc.events.on('restore', function () {
    if (!$('input[name=email]').val().length) {
      $('.error').removeClass('invisible')
      setTimeout(() => {
        $('.error').addClass('invisible')
      }, 3000)
    } else {
      // setExpDate();
      // setTimer();
      mc.api.call("auth.forgot", {
        email: $('input[name=email]')[0].value
      }).then(function (res) {
        if (res) {
          // mc.router.go('/password');
          notify(mc.i18n('notify.email_sent'));
          setExpDate();
          setTimer();
        } else {
          $('.error').removeClass('invisible');
          setTimeout(() => {
            $('.error').addClass('invisible')
          }, 3000)
        }
      });
    }
  });

  mc.events.on('sys:page.init:login/forgot', function () {
    /*$('button').on('click', () => {
      setExpDate()
      setTimer();
      notify(mc.i18n('notify.email_sent'));
    });*/
    setTimer();
  });

  return function (params) {
    document.title = `${mc.i18n('auth.title')} | Botto Platform`;

    return view();
  }
});