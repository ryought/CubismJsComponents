var piximotionblend;
(function (piximotionblend) {
    var app;
    var model;
    var message;
    var time = 0;
    var width = window.innerWidth;
    var height = (width / 16.0) * 9.0;
    viewMain();
    loadAssets()
        .then(addModel)
        .then(showSlider)
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
    function showSlider() {
        var uiStage = new PIXI.UI.Stage(width, height);
        app.stage.addChild(uiStage);
        var sliderContainer = new PIXI.UI.Container("30%", "100%");
        uiStage.addChild(sliderContainer);
        var cb_bg = PIXI.Texture.fromImage("../assets/UI/grey_box.png");
        var cb_mark = PIXI.Texture.fromImage("../assets/UI/grey_checkmarkGrey.png");
        var sl_track = PIXI.Texture.fromImage("../assets/UI/grey_button01.png");
        var sl_handle = PIXI.Texture.fromImage("../assets/UI/grey_circle.png");
        var textStyle = { fill: ['#000000', '#000000'], fontSize: 16, fontFamily: 'Calibri', fontWeight: 'bold' };
        var textStyleMode = { fill: ['#000000', '#000000'], fontSize: 12, fontFamily: 'Calibri', fontWeight: 'bold' };
        var textBW = new PIXI.UI.Text("Blend Weight", textStyle);
        textBW.top = 20;
        textBW.left = "15%";
        sliderContainer.addChild(textBW);
        var textBM = new PIXI.UI.Text("Blend Mode", textStyle);
        textBM.top = 20;
        textBM.left = "68%";
        sliderContainer.addChild(textBM);
        var textA = new PIXI.UI.Text("0", textStyle);
        textA.top = -20;
        textA.horizontalAlign = "center";
        var sliderA = new PIXI.UI.Slider({
            track: new PIXI.UI.Sprite(sl_track),
            handle: new PIXI.UI.Sprite(sl_handle),
            fill: new PIXI.UI.Sprite(sl_track),
            value: 100,
            onValueChanging: function (val) {
                textA.value = val + "";
                model.animator.getLayer("motionA").weight = val * 0.01;
            }
        });
        sliderA.track.height = 15;
        sliderA.fill.height = 15;
        sliderA.handle.height = 20;
        sliderA.handle.width = 20;
        sliderA.handle.verticalAlign = null;
        sliderA.handle.y = 8;
        sliderA.handle.tint = 0xb7bcae;
        sliderA.fill.tint = 0xb4f154;
        sliderA.track.tint = 0xe4e7de;
        sliderA.width = "55%";
        sliderA.top = 65;
        sliderA.left = 10;
        sliderA.handle.addChild(textA);
        sliderContainer.addChild(sliderA);
        for (var i = 1; i <= 2; i++) {
            (function () {
                var cb = new PIXI.UI.CheckBox({
                    checked: i === 1,
                    background: new PIXI.UI.Sprite(cb_bg),
                    checkmark: new PIXI.UI.Sprite(cb_mark),
                    checkgroup: "motionA",
                    value: "checkbox " + i
                });
                cb.width = 25;
                cb.height = 25;
                cb.checkmark.width = cb.width - 8;
                cb.checkmark.height = cb.height - 8;
                cb.x = String(40 + 22 * i) + "%";
                cb.y = sliderA.y - 5;
                cb.on("change", function (checked) {
                    if (checked) {
                        cb.checkmark.alpha = 1;
                        if (cb.value == "checkbox 1")
                            model.animator.getLayer("motionA").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
                        else
                            model.animator.getLayer("motionA").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD;
                    }
                    else {
                        cb.checkmark.alpha = 0;
                    }
                });
                sliderContainer.addChild(cb);
                var text;
                if (i == 1)
                    text = new PIXI.UI.Text("OVERRIDE", textStyleMode);
                else if (i == 2)
                    text = new PIXI.UI.Text("ADD", textStyleMode);
                text.x = cb.width + 3;
                text.y = 5;
                cb.addChild(text);
            })();
        }
        var textB = new PIXI.UI.Text("0", textStyle);
        textB.top = -20;
        textB.horizontalAlign = "center";
        var sliderB = new PIXI.UI.Slider({
            track: new PIXI.UI.Sprite(sl_track),
            handle: new PIXI.UI.Sprite(sl_handle),
            fill: new PIXI.UI.Sprite(sl_track),
            value: 100,
            onValueChanging: function (val) {
                textB.value = val + "";
                model.animator.getLayer("motionB").weight = val * 0.01;
                model.animator.getLayer("motionB").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
            }
        });
        sliderB.track.height = 15;
        sliderB.fill.height = 15;
        sliderB.handle.height = 20;
        sliderB.handle.width = 20;
        sliderB.handle.verticalAlign = null;
        sliderB.handle.y = 8;
        sliderB.handle.tint = 0xb7bcae;
        sliderB.fill.tint = 0x4245f4;
        sliderB.track.tint = 0xe4e7de;
        sliderB.width = "55%";
        sliderB.top = 115;
        sliderB.left = 10;
        sliderB.handle.addChild(textB);
        sliderContainer.addChild(sliderB);
        for (var i = 1; i <= 2; i++) {
            (function () {
                var cb = new PIXI.UI.CheckBox({
                    checked: i === 1,
                    background: new PIXI.UI.Sprite(cb_bg),
                    checkmark: new PIXI.UI.Sprite(cb_mark),
                    checkgroup: "motionB",
                    value: "checkbox " + i
                });
                cb.width = 25;
                cb.height = 25;
                cb.checkmark.width = cb.width - 8;
                cb.checkmark.height = cb.height - 8;
                cb.x = String(40 + 22 * i) + "%";
                cb.y = sliderB.y - 5;
                cb.on("change", function (checked) {
                    if (checked) {
                        cb.checkmark.alpha = 1;
                        if (cb.value == "checkbox 1")
                            model.animator.getLayer("motionB").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
                        else
                            model.animator.getLayer("motionB").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD;
                    }
                    else {
                        cb.checkmark.alpha = 0;
                    }
                });
                sliderContainer.addChild(cb);
                var text;
                if (i == 1)
                    text = new PIXI.UI.Text("OVERRIDE", textStyleMode);
                else if (i == 2)
                    text = new PIXI.UI.Text("ADD", textStyleMode);
                text.x = cb.width + 3;
                text.y = 5;
                cb.addChild(text);
            })();
        }
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            uiStage.resize(width, height);
        };
        onResize();
        window.addEventListener('resize', onResize);
    }
    function loadAssets() {
        var p1 = new Promise(function (resolve, reject) {
            new PIXI.loaders.Loader()
                .add('model3', "../assets/Mark_model3/Mark.model3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
                .add('motionA', "../assets/Mark_model3/mark_m01.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
                .add('motionB', "../assets/Mark_model3/mark_m03.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
                .load(function (loader, resources) {
                new LIVE2DCUBISMPIXI.ModelBuilder().buildFromModel3Json(loader, resources['model3'], function (_model) {
                    if (_model == null)
                        reject();
                    model = _model;
                    var animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motionA'].data);
                    model.animator.addLayer("motionA", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD, 1.0);
                    model.animator.getLayer("motionA").play(animation);
                    var animation2 = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motionB'].data);
                    model.animator.addLayer("motionB", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD, 1.0);
                    model.animator.getLayer("motionB").play(animation2);
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
        app.stage.addChild(model);
        app.stage.addChild(model.masks);
        app.ticker.add(function (deltaTime) {
            model.update(deltaTime);
            model.masks.update(app.renderer);
        });
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            model.position = new PIXI.Point((width * 0.5), (height * 0.5));
            model.scale = new PIXI.Point((width * 0.4), (width * 0.4));
            model.masks.resize(app.view.width, app.view.height);
        };
        onResize();
        window.addEventListener('resize', onResize);
    }
    function loadFail() {
        console.log("Load Fail");
    }
})(piximotionblend || (piximotionblend = {}));
