/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */
namespace piximotionblend{

    // Properties.
    let app: PIXI.Application;
    let model: LIVE2DCUBISMPIXI.Model;
    let message: PIXI.Text;
    let time = 0;
    // Keep 16:9 ratio.
    let width = window.innerWidth;
    let height = (width / 16.0) * 9.0;

    // Show pixi main stage.
    viewMain();

    // Load and add cubism model.
    loadAssets()
    .then(addModel)
    .then(showSlider)
    .catch(loadFail);

    // Show message window and text.
    //showMessageWindow();

    function viewMain(){
        // Create app.
        app = new PIXI.Application(1280, 720, {backgroundColor : 0x1099bb});

        document.body.appendChild(app.view);

        // Set background image
        let bgTexture = PIXI.Texture.fromImage('../assets/background.png');
        // new sprite
        let background = new PIXI.Sprite(bgTexture);
        app.stage.addChild(background);


        // Do that responsive design...
        let onResize = (event: any = null) => {
            // Update view size .
            width = window.innerWidth;
            height = (width / 16.0) * 9.0;

            // Resize app.
            app.view.style.width = width + "px";
            app.view.style.height = height + "px";

            app.renderer.resize(width, height);

            background.width = app.renderer.width;
            background.height = app.renderer.height;
        };
        onResize();
        window.addEventListener('resize', onResize);
    }

    function showSlider(){
        let uiStage = new PIXI.UI.Stage(width, height);
        app.stage.addChild(uiStage);

        let sliderContainer = new PIXI.UI.Container("30%", "100%");
        uiStage.addChild(sliderContainer);

        let cb_bg = PIXI.Texture.fromImage("../assets/UI/grey_box.png");
        let cb_mark = PIXI.Texture.fromImage("../assets/UI/grey_checkmarkGrey.png");
        let sl_track = PIXI.Texture.fromImage("../assets/UI/grey_button01.png");
        let sl_handle = PIXI.Texture.fromImage("../assets/UI/grey_circle.png");

        let textStyle = { fill: ['#000000', '#000000'], fontSize: 16, fontFamily: 'Calibri', fontWeight: 'bold' };
        let textStyleMode = { fill: ['#000000', '#000000'], fontSize: 12, fontFamily: 'Calibri', fontWeight: 'bold' };

        let textBW = new PIXI.UI.Text("Blend Weight", textStyle);
        textBW.top = 20;
        textBW.left = "15%";
        sliderContainer.addChild(textBW);

        let textBM = new PIXI.UI.Text("Blend Mode", textStyle);
        textBM.top = 20;
        textBM.left = "68%";
        sliderContainer.addChild(textBM);

        let textA = new PIXI.UI.Text("0", textStyle);
        textA.top = -20;
        textA.horizontalAlign = "center";
        let sliderA = new PIXI.UI.Slider({
            track: new PIXI.UI.Sprite(sl_track),
            handle: new PIXI.UI.Sprite(sl_handle),
            fill: new PIXI.UI.Sprite(sl_track),
            value: 100,
            onValueChanging: function (val: any) {
                textA.value = val + "";
                model.animator.getLayer("motionA").weight = val * 0.01;
            }
        });
        //other settings
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
                cb.x = String(40 + 22*i) + "%";
                cb.y = sliderA.y - 5;
                cb.on("change", function (checked: any) {
                    if (checked) {
                        cb.checkmark.alpha = 1;
                        if(cb.value == "checkbox 1")
                            model.animator.getLayer("motionA").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
                        else
                            model.animator.getLayer("motionA").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD;
                    }
                    else {
                        cb.checkmark.alpha = 0;
                    }
                });
                sliderContainer.addChild(cb);

                let text:PIXI.UI.Text;
                if(i == 1)
                    text = new PIXI.UI.Text("OVERRIDE", textStyleMode);
                else if(i == 2)
                    text = new PIXI.UI.Text("ADD", textStyleMode);
                text.x = cb.width + 3;
                text.y = 5;
                cb.addChild(text);
            })();
        }


        let textB = new PIXI.UI.Text("0", textStyle);
        textB.top = -20;
        textB.horizontalAlign = "center";
        let sliderB = new PIXI.UI.Slider({
            track: new PIXI.UI.Sprite(sl_track),
            handle: new PIXI.UI.Sprite(sl_handle),
            fill: new PIXI.UI.Sprite(sl_track),
            value: 100,
            onValueChanging: function (val: any) {
                textB.value = val + "";
                model.animator.getLayer("motionB").weight = val * 0.01;
                model.animator.getLayer("motionB").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
            }
        });
        //other settings
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
                cb.x = String(40 + 22*i) + "%";
                cb.y = sliderB.y - 5;
                cb.on("change", function (checked: any) {
                    if (checked) {
                        cb.checkmark.alpha = 1;
                        if(cb.value == "checkbox 1")
                            model.animator.getLayer("motionB").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
                        else
                            model.animator.getLayer("motionB").blend = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD;
                    }
                    else {
                        cb.checkmark.alpha = 0;
                    }
                });
                sliderContainer.addChild(cb);

                let text:PIXI.UI.Text;
                if(i == 1)
                    text = new PIXI.UI.Text("OVERRIDE", textStyleMode);
                else if(i == 2)
                    text = new PIXI.UI.Text("ADD", textStyleMode);
                text.x = cb.width + 3;
                text.y = 5;
                cb.addChild(text);
            })();
        }




        // Do that responsive design...
        let onResize = (event: any = null) => {
            uiStage.resize(width, height);
        };
        onResize();
        window.addEventListener('resize', onResize);
    }

    // Load cubism assets.
    function loadAssets() {
        // Load one cubism model per one promise.
        var p1 = new Promise((resolve, reject) => {
            new PIXI.loaders.Loader()
            .add('model3', "../assets/Mark_model3/Mark.model3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
            .add('motionA', "../assets/Mark_model3/mark_m01.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
            .add('motionB', "../assets/Mark_model3/mark_m03.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
            .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
                // Create model.
                new LIVE2DCUBISMPIXI.ModelBuilder().buildFromModel3Json(loader, resources['model3'], (_model: LIVE2DCUBISMPIXI.Model) => {
                    if(_model == null)
                        reject();

                    // Set Model instance.
                    model = _model;
                    // Load animation.
                    let animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motionA'].data);
                    // Add animation layer.
                    model.animator.addLayer("motionA", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD, 1.0);
                    // Play animation.
                    model.animator.getLayer("motionA").play(animation);

                    let animation2 = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motionB'].data);
                    // Add animation layer.
                    model.animator.addLayer("motionB", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD, 1.0);
                    // Play animation.
                    model.animator.getLayer("motionB").play(animation2);

                    // Add animation callback with userdata value.
                    animation.addAnimationCallback((value: string) => {
                        message.text = value;
                    })

                    resolve();
                });

            });
        });

        // When all promise ended, will return.
        return Promise.all([p1]);
    }


    function addModel() {
        // Add model to stage.
        app.stage.addChild(model);
        app.stage.addChild(model.masks);

        // Set up ticker.
        app.ticker.add((deltaTime) => {
            model.update(deltaTime);
            model.masks.update(app.renderer);
        });

        // Do that responsive design...
        let onResize = (event: any = null) => {
            // Resize model.
            model.position = new PIXI.Point((width * 0.5), (height * 0.5));
            model.scale = new PIXI.Point((width * 0.4), (width * 0.4));
            // Resize mask texture.
            model.masks.resize(app.view.width, app.view.height);
        };
        onResize();
        window.addEventListener('resize', onResize);
    }


    function loadFail(){
        console.log("Load Fail");
    }

}