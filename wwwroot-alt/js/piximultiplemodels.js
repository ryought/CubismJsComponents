var piximultiplemodel;
(function (piximultiplemodel) {
    var app;
    var koharu;
    var mark;
    var width = window.innerWidth;
    var height = (width / 16.0) * 9.0;
    viewMain();
    loadAssets()
        .then(addModel)
        .catch(loadFail);
    function viewMain() {
        app = new PIXI.Application(1280, 720, { backgroundColor: 0x1099bb });
        document.body.appendChild(app.view);
        var bgTexture = PIXI.Texture.fromImage('../assets/background.png');
        var background = new PIXI.Sprite(bgTexture);
        app.stage.addChild(background);
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            width = window.innerWidth;
            height = (width / 16.0) * 9.0;
            app.view.style.width = width + "px";
            app.view.style.height = height + "px";
            app.renderer.resize(width, height);
            background.width = app.renderer.width;
            background.height = app.renderer.height;
        };
        onResize();
        window.addEventListener('resize', onResize);
    }
    function loadAssets() {
        var p1 = new Promise(function (resolve, reject) {
            new PIXI.loaders.Loader()
                .add('model3', "../assets/Koharu_model3/koharu.model3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
                .add('motion', "../assets/Koharu_model3/01.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
                .load(function (loader, resources) {
                new LIVE2DCUBISMPIXI.ModelBuilder().buildFromModel3Json(loader, resources['model3'], function (model) {
                    if (model == null)
                        reject();
                    koharu = model;
                    var animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motion'].data);
                    koharu.animator.addLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
                    koharu.animator.getLayer("base").play(animation);
                    resolve();
                });
            });
        });
        var p2 = new Promise(function (resolve, reject) {
            new PIXI.loaders.Loader()
                .add('model3', "../assets/Mark/Mark.model3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
                .add('motion', "../assets/Mark/Mark.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
                .load(function (loader, resources) {
                new LIVE2DCUBISMPIXI.ModelBuilder().buildFromModel3Json(loader, resources['model3'], function (model) {
                    if (model == null)
                        reject();
                    mark = model;
                    var animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motion'].data);
                    mark.animator.addLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
                    mark.animator.getLayer("base").play(animation);
                    resolve();
                });
            });
        });
        return Promise.all([p1, p2]);
    }
    function addModel() {
        app.stage.addChild(koharu);
        app.stage.addChild(koharu.masks);
        app.stage.addChild(mark);
        app.stage.addChild(mark.masks);
        app.ticker.add(function (deltaTime) {
            koharu.update(deltaTime);
            koharu.masks.update(app.renderer);
            mark.update(deltaTime);
            mark.masks.update(app.renderer);
        });
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            koharu.position = new PIXI.Point((width * 0.25), (height * 0.5));
            koharu.scale = new PIXI.Point((width * 0.4), (width * 0.4));
            koharu.masks.resize(app.view.width, app.view.height);
            mark.position = new PIXI.Point((width * 0.75), (height * 0.5));
            mark.scale = new PIXI.Point((width * 0.4), (width * 0.4));
            mark.masks.resize(app.view.width, app.view.height);
        };
        onResize();
        window.addEventListener('resize', onResize);
    }
    function loadFail() {
        console.log("Load Fail");
    }
})(piximultiplemodel || (piximultiplemodel = {}));
