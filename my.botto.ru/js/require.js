(function () {
    let modules = {};
    let config = {
        baseUrl: document.location.host,
        paths: {}
    };

    let loaders = {
        js: async (src, name) => {
            let script = document.createElement("script");
            script.async = true;
            script.src = src + (require.config.version ? ('?v=' + require.config.version) : '?v=' + (new Date()).getTime());
            script.dataset.name = name;
            document.head.append(script);

            return new Promise((resolve) => {
                script.onload = () => {
                    let timer = setInterval(function () {
                        if (!(modules[name] instanceof Promise)) {
                            clearInterval(timer);
                            return resolve(modules[name])
                        }
                    }, 0)
                };
            })
        },
        json: async (src, name) => {
            return fetch(src).then((resp) => resp.json())
        },

        text: async (src, name) => {
            return fetch(src).then(resp => resp.text())
        },

        css: (src, name) => {
            let css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = src + (require.config.version ? ('?v=' + require.config.version) : '?v=' + (new Date()).getTime());
            document.head.append(css);
            return new Promise((resolve) => {
                css.onload = () => {
                    resolve(true)
                }
            });
        },

        mst: async (src, name) => {
            return require(["render"], async (render) => {
                let path = (require.config.render && require.config.render.path) ? require.config.render.path : '/';
                src = path + src + (require.config.version ? ('?v=' + require.config.version) : '?v=' + (new Date()).getTime());
                let template = render.compile(await fetch(src).then(resp => resp.text()));
                return (data) => {
                    return render.render(template, data)
                }
            })
        }
    };

    function load(depend) {
        if (!require.config.baseUrl) {
            require.config.baseUrl = '/'
        }
        depend = depend.split("!");
        let plugin = depend.length > 1 && depend[0] || 'js';
        let name = depend[1] || depend[0];

        let src = ((name.match(/^\//)||name.match(/^https?:\/\//)) && name + '.' + plugin
            || require.config.baseUrl + (require.config.paths[name] || name) + '.' + plugin)
            .replace(/[\/]{2,}/g, '/').replace(/(https?:\/)([^\/])/g, '$1/$2');

        src = src.match(/\/https?/) && src.substring(1) || src;
        return loaders[plugin](src, name)
    }

    this.require = async function (depends, cb) {
        let resolved_depends = [];
        for (let depend of depends) {
            let name = depend.split("!").pop();
            modules[name] = modules[name] || load(depend)
        }

        let i = 0;
        for (let depend of depends) {
            let name = depend.split("!").pop();
            modules[name] = await modules[name];

            resolved_depends[i++] = modules[name]
        }

        return typeof cb == 'function' && cb(...resolved_depends) || resolved_depends
    };

    this.require.config = (conf) => {
        for (let param in conf) {
            this.require.config[param] = conf[param]
        }
    };

    this.require.addLoader = function (ext, cb) {
        !loaders[ext] && (loaders[ext] = cb);
    };

    this.define = async function (n, d, f) {
        let module = f || d || n;
        let depends = typeof d == "object" && d || typeof n == "object" && n || [];
        let alias = typeof n == "string" && n || null
        let name = document.currentScript.dataset.name;
        modules[name] = await this.require(depends, module);
        alias && (modules[alias] = modules[name])
    };

    this.define.amd = true;
    document.currentScript.dataset.version && (this.require.config.version = document.currentScript.dataset.version)
    document.currentScript.dataset.main && require([document.currentScript.dataset.main])
})();
