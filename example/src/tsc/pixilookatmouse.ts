/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

namespace pixilookatmouse{

PIXI.loader
    .add('moc', "../assets/haru/haru.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
    .add('texture00', "../assets/haru/haru.1024/texture_00.png")
    .add('texture01', "../assets/haru/haru.1024/texture_01.png")
    .add('texture02', "../assets/haru/haru.1024/texture_02.png")
    .add('physics', "../assets/haru/Physics.physics3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .add('motion', "../assets/haru/motions/haru_idle_03.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
    .add('emptymotion', "../assets/Common/empty.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
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
            .addTexture(0, resources['texture00'].texture)
            .addTexture(1, resources['texture01'].texture)
            .addTexture(2, resources['texture02'].texture)
            .setPhysics3Json(resources['physics'].data)
            .addAnimatorLayer("Motion", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .addAnimatorLayer("Drag", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .build();


        // Add model to stage.
        app.stage.addChild(model);
        app.stage.addChild(model.masks);


        // Load animation.
        let animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);
        let emptyAnimation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['emptymotion'].data);


        // Play animation.
        model.animator
            .getLayer("Motion")
            .play(animation);


        // Set up ticker.
        app.ticker.add((deltaTime) => {
            model.update(deltaTime);
            model.masks.update(app.renderer);

            updateParameter();
        });


        // Do that responsive design...
        const onResize =  (event: any = null) => {
            // Keep 16:9 ratio.
            const width = window.innerWidth;
            const height = (width / 16.0) * 9.0;


            // Resize app.
            app.view.style.width = width + "px";
            app.view.style.height = height + "px";
            app.renderer.resize(width, height);


            // Resize model.
            model.position = new PIXI.Point((width * 0.5), (height * 1.2));
            model.scale = new PIXI.Point((model.position.x * 2.2), (model.position.x * 2.2));

            // Resize mask texture.
            model.masks.resize(app.view.width, app.view.height);

        };
        onResize();
        window.onresize = onResize;


        let param_angle_x = model.parameters.ids.indexOf("PARAM_ANGLE_X");
        if(param_angle_x < 0){
            param_angle_x = model.parameters.ids.indexOf("ParamAngleX")
        }
        let param_angle_y = model.parameters.ids.indexOf("PARAM_ANGLE_Y");
        if(param_angle_y < 0){
            param_angle_y = model.parameters.ids.indexOf("ParamAngleY")
        }
        let param_body_angle_x = model.parameters.ids.indexOf("PARAM_BODY_ANGLE_X");
        if(param_body_angle_x < 0){
            param_body_angle_x = model.parameters.ids.indexOf("ParamBodyAngleX")
        }
        let param_eye_ball_x = model.parameters.ids.indexOf("PARAM_EYE_BALL_X");
        if(param_eye_ball_x < 0){
            param_eye_ball_x = model.parameters.ids.indexOf("ParamEyeBallX")
        }
        let param_eye_ball_y = model.parameters.ids.indexOf("PARAM_EYE_BALL_Y");
        if(param_eye_ball_y < 0){
            param_eye_ball_y = model.parameters.ids.indexOf("ParamEyeBallY")
        }


        let pos_x = 0.0;
        let pos_y = 0.0;


        const onDragEnd = (event: any) => {
            pos_x = 0.0;
            pos_y = 0.0;
        }


        const onDragMove = (event: any) => {
            const mouse_x = model.position.x - event.offsetX;
            const mouse_y = model.position.y - event.offsetY;

            // Normalization => mouse coordinates from -1.0 to 1.0
            let height = app.screen.height / 2;
            let width = app.screen.width / 2;
            let scale = 1.0 - (height / model.scale.y);
            pos_x = - mouse_x / height;
            // posY coordinate adjust head position
            pos_y = - (mouse_y / width) + scale;
        }


        app.view.addEventListener('pointerup', onDragEnd, false);
        app.view.addEventListener('pointerout', onDragEnd, false);
        app.view.addEventListener('pointermove', onDragMove, false);


        const updateParameter = () => {
            emptyAnimation.evaluate = (time, weight, blend, target) => {
                // angle_x
                if (param_angle_x >= 0) {
                    target.parameters.values[param_angle_x] =
                    blend(target.parameters.values[param_angle_x], pos_x * 30, 0, weight);
                }
                // angle_y
                if (param_angle_y >= 0) {
                    target.parameters.values[param_angle_y] =
                    blend(target.parameters.values[param_angle_y], -pos_y * 30, 0, weight);
                }
                // body_angle_x
                if (param_body_angle_x >= 0) {
                    target.parameters.values[param_body_angle_x] =
                    blend(target.parameters.values[param_body_angle_x], pos_x * 10, 0, weight);
                }
                // eye_ball_x
                if (param_eye_ball_x >= 0) {
                    target.parameters.values[param_eye_ball_x] =
                    blend(target.parameters.values[param_eye_ball_x], pos_x, 0, weight);
                }
                // eye_ball_y
                if (param_eye_ball_y >= 0) {
                    target.parameters.values[param_eye_ball_y] =
                    blend(target.parameters.values[param_eye_ball_y], -pos_y, 0, weight);
                }
            }
            model.animator.getLayer("Drag").play(emptyAnimation);
        }


    });
}