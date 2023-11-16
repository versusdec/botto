define(["microcore", "mst!/login/recover"], function (mc, view, scripts) {

  let code;

  function preload(cb) {
    require([
      "mst!/layouts/main",
      "mst!/layouts/areas/footer",
      "mst!/layouts/areas/header",
      "mst!/layouts/areas/nav",
      "mst!/dashboard/index",
      "mst!/layouts/components/confirm",
      "mst!/layouts/components/popup",
      "mst!/layouts/components/notify",
      "app/modules/header",
      "app/modules/confirm",
      "app/modules/popup",
      "app/modules/notify",
      "app/controllers/dashboard/index"
    ], () => {
    })
  }

  mc.events.on('recover', function () {
    if ($('[name=password]').val() !== $('[name=confirm]').val()) {
      $('.error').removeClass('invisible')
      setTimeout(() => {
        $('.error').addClass('invisible')
      }, 3000)
    } else {
      mc.api.call("auth.forgot", {
        token: code,
        password: $('input[name=password]').val()
      }).then(function (res) {
        if (res) {
          $('#login').addClass('open');
          preload();
          setTimeout(() => {
            mc.router.go('/')
          }, 2250)
        }
      });
    }

  });



  return function (params) {
    document.title = `${mc.i18n('auth.title')} | Botto Platform`;
    code = params.code;
    return view();
  }
});