var pixiuserdata;
(function (pixiuserdata) {
    var app;
    var koharu;
    var message;
    var width = window.innerWidth;
    var height = (width / 16.0) * 9.0;
    viewMain();
    loadAssets()
        .then(addModel)
        .then(showMessageWindow)
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
    function showMessageWindow() {
        var messageWindow = new PIXI.Graphics();
        app.stage.addChild(messageWindow);
        var style = { font: 'bold 24pt Arial', fill: 'white' };
        message = new PIXI.Text("", style);
        messageWindow.addChild(message);
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            messageWindow.clear();
            messageWindow.lineStyle(4, 0xFFFFFF, 1);
            messageWindow.beginFill(0x0000FF, 0.4);
            messageWindow.drawRoundedRect(width * 0.15, height * 0.7, width * 0.7, height * 0.25, 15);
            messageWindow.endFill();
            message.position.x = width * 0.15 + 10;
            message.position.y = height * 0.7 + 5;
            message.style.fontSize = width * 0.035;
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
                    animation.addAnimationCallback(function (value) {
                        message.text = value;
                    });
                    resolve();
                });
            });
        });
        return Promise.all([p1]);
    }
    function addModel() {
        app.stage.addChild(koharu);
        app.stage.addChild(koharu.masks);
        app.ticker.add(function (deltaTime) {
            koharu.update(deltaTime);
            koharu.masks.update(app.renderer);
        });
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            koharu.position = new PIXI.Point((width * 0.5), (height * 0.5));
            koharu.scale = new PIXI.Point((width * 0.4), (width * 0.4));
            koharu.masks.resize(app.view.width, app.view.height);
        };
        onResize();
        window.addEventListener('resize', onResize);
    }
    function loadFail() {
        console.log("Load Fail");
    }
})(pixiuserdata || (pixiuserdata = {}));
