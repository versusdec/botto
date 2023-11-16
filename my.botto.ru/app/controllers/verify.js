define(["microcore", "mst!/verify", "notify"], function (mc, view, notify) {


  return async function (params) {
    document.title = "Botto Platform";

    mc.api.call('users.verify', {
      type: 'email',
      code: +params.code
    }).then(res => {
      if (res) {
        notify(mc.i18n('profile.verify.email_verified'))
        mc.router.go('/')
      } else {
        notify(mc.i18n('system.error'))
        mc.router.go('/profile')
      }
    })

    return view();
  }
});