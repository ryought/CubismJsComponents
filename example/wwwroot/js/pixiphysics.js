PIXI.loader
    .add('moc', "../assets/Physics/Physics.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
    .add('texture', "../assets/Physics/Physics.png")
    .add('physics', "../assets/Physics/Physics.physics3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .add('motion', "../assets/Physics/Physics.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .load(function (loader, resources) {
    var app = new PIXI.Application(1280, 720, { backgroundColor: 0x1099bb });
    document.body.appendChild(app.view);
    var moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(resources['moc'].data);
    var model = new LIVE2DCUBISMPIXI.ModelBuilder()
        .setMoc(moc)
        .setTimeScale(1)
        .addTexture(0, resources['texture'].texture)
        .setPhysics3Json(resources['physics'].data)
        .addAnimatorLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
        .build();
    app.stage.addChild(model);
    app.stage.addChild(model.masks);
    var animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);
    model.animator
        .getLayer("base")
        .play(animation);
    app.ticker.add(function (deltaTime) {
        model.update(deltaTime);
        model.masks.update(app.renderer);
    });
    var onResize = function (event) {
        if (event === void 0) { event = null; }
        var width = window.innerWidth;
        var height = (width / 16.0) * 9.0;
        app.view.style.width = width + "px";
        app.view.style.height = height + "px";
        app.renderer.resize(width, height);
        model.position = new PIXI.Point((width * 0.5), (height * 0.5));
        model.scale = new PIXI.Point((model.position.x * 0.8), (model.position.x * 0.8));
        model.masks.resize(app.view.width, app.view.height);
    };
    onResize();
    window.onresize = onResize;
});
