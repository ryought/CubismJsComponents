/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */


PIXI.loader
    .add('moc', "assets/Physics_Test/physics/Physics.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
    .add('texture', "assets/Physics_Test/physics/Physics.1024/texture_00.png")
    .add('physics', "assets/Physics_Test/physics/Physics.physics3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .add('motion', "assets/Physics_Test/physics/Scene1.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
        // Create app.
        let canvas = document.getElementById('canvas');
        let app = new PIXI.Application(1280, 720, {backgroundColor : 0x1099bb});

        
        document.body.appendChild(app.view);


        // Load moc.
        let moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(resources['moc'].data);

        // Load physics.
        let physics = resources['physics'].data;

        // Create model.
        let model = new LIVE2DCUBISMPIXI.ModelBuilder()
            .setMoc(moc)
            .setTimeScale(1)
            .addTexture(0, resources['texture'].texture)
            .setPhysics3Json(physics)
            .addAnimatorLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .build();

        
        // Add model to stage.
        app.stage.addChild(model);


        // Load animation.
        let animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);


        // Play animation.
        model.animator
            .getLayer("base")
            .play(animation);
            

        // Set up ticker.
        app.ticker.add((deltaTime) => {
            model.update(deltaTime);
        });


        // Do that responsive design...
        let onResize = function (event: any = null) {
            // Keep 16:9 ratio.
            var width = window.innerWidth * 0.8;
            var height = (width / 16.0) * 9.0;
            

            // Resize app.
            app.view.style.width = width + "px";
            app.view.style.height = height + "px";
            
            app.renderer.resize(width, height);


            // Resize model.
            model.position = new PIXI.Point((width * 0.5), (height * 0.5));
            model.scale = new PIXI.Point((model.position.x * 0.8), (model.position.x * 0.8));
        };
        onResize();
        window.onresize = onResize;


        // TODO Clean up properly.
    });
