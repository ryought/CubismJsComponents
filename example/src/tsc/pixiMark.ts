/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */


PIXI.loader
    .add('moc', "../assets/Mark/Mark.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
    .add('texture', "../assets/Mark/Mark.png")
    .add('physics', "../assets/Mark/Mark.physics3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .add('motion', "../assets/Mark/Mark.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
        // Create app.
        let app = new PIXI.Application(1280, 720, {backgroundColor : 0x1099bb});

        
        document.body.appendChild(app.view);


        // Load moc.
        let moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(resources['moc'].data);


        // Create model.
        let model = new LIVE2DCUBISMPIXI.ModelBuilder()
            .setMoc(moc)
            .setTimeScale(1)
            .addTexture(0, resources['texture'].texture)
            .setPhysics3Json(resources['physics'].data)
            .addAnimatorLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .build();

        
        // Add model to stage.
        app.stage.addChild(model);
        app.stage.addChild(model.masks);


        // Load animation.
        let animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);


        // Play animation.
        model.animator
            .getLayer("base")
            .play(animation);
            

        // Set up ticker.
        app.ticker.add((deltaTime) => {
            model.update(deltaTime);
            model.masks.update(app.renderer);
        });


        // Do that responsive design...
        let onResize = function (event: any = null) {
            // Keep 16:9 ratio.
            var width = window.innerWidth;
            var height = (width / 16.0) * 9.0;
            

            // Resize app.
            app.view.style.width = width + "px";
            app.view.style.height = height + "px";
            
            app.renderer.resize(width, height);


            // Resize model.
            model.position = new PIXI.Point((width * 0.5), (height * 0.5));
            model.scale = new PIXI.Point((model.position.x * 0.8), (model.position.x * 0.8));
            
            // Resize mask texture.
            model.masks.resize(app.view.width, app.view.height);

        };
        onResize();
        window.onresize = onResize;


        // TODO Clean up properly.
    });
