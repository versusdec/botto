define(["microcore", "mst!/pixel/list/list"],
  function (mc, view) {

      return async function (params) {
          document.title = `${mc.i18n('pixel.title')} | Botto Platform`;
          let hash_params = mc.router.hash();

          return view({

          });
      }
  }
);