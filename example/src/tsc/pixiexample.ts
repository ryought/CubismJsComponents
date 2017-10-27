/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */


PIXI.loader
    .add('moc', "assets/Triangle/triangle.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
    .add('texture', "assets/Triangle/triangle.1024/texture_00.png")
    .add('motion', "assets/Triangle/triangle.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
        // Create app.
        let canvas = document.getElementById('canvas');
        let app = new PIXI.Application(1280, 720, {backgroundColor : 0x1099bb});

        
        document.body.appendChild(app.view);


        // Load moc.
        let moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(resources['moc'].data);


        // Create model.
        let model = new LIVE2DCUBISMPIXI.ModelBuilder()
            .setMoc(moc)
            .setTimeScale(1)
            .addTexture(0, resources['texture'].texture)
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


        let maskTextures = new Array<PIXI.RenderTexture>(model.maskSprites.length);
        
        for (let m = 0; m < model.maskSprites.length; ++m)
        {
            maskTextures[m] = PIXI.RenderTexture.create(app.view.width, app.view.height);
            model.maskSprites[m] = new PIXI.Sprite(maskTextures[m]);
            app.stage.addChild(model.maskSprites[m]);
            
            if(model.maskMeshes[m].children.length > 0)
                model.meshes[m].mask = model.maskSprites[m];
        }
        
        // Set up ticker.
        app.ticker.add((deltaTime) => {
            model.update(deltaTime);

            for (let m = 0; m < model.maskSprites.length; ++m)
            {
                if(model.maskMeshes[m].children.length > 0)
                    app.renderer.render(model.maskMeshes[m], maskTextures[m], true, null, false); //3番目がtrueで毎回クリーン化
            }

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

            // Resize mask Meshes.
            for (let m = 0; m < model.maskMeshes.length; ++m)
            {
                model.maskMeshes[m].position = model.getGlobalPosition();
                model.maskMeshes[m].scale = model.scale;
            }
            
            for (let m = 0; m < model.maskSprites.length; ++m)
            {
                //メソッドでリサイズしてしまう
                maskTextures[m].resize(app.view.width, app.view.height, false);
            }
        };
        onResize();
        window.onresize = onResize;


        // TODO Clean up properly.
    });
