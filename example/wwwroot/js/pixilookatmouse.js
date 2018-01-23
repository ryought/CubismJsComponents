var pixilookatmouse;
(function (pixilookatmouse) {
    PIXI.loader
        .add('moc', "../assets/haru/haru.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
        .add('texture00', "../assets/haru/haru.1024/texture_00.png")
        .add('texture01', "../assets/haru/haru.1024/texture_01.png")
        .add('texture02', "../assets/haru/haru.1024/texture_02.png")
        .add('physics', "../assets/haru/Physics.physics3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .add('motion', "../assets/haru/motions/haru_idle_03.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .add('emptymotion', "../assets/Common/empty.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .load(function (loader, resources) {
        var app = new PIXI.Application(1280, 720, { backgroundColor: 0x1099bb });
        document.body.appendChild(app.view);
        var moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(resources['moc'].data);
        var model = new LIVE2DCUBISMPIXI.ModelBuilder()
            .setMoc(moc)
            .setTimeScale(1)
            .addTexture(0, resources['texture00'].texture)
            .addTexture(1, resources['texture01'].texture)
            .addTexture(2, resources['texture02'].texture)
            .setPhysics3Json(resources['physics'].data)
            .addAnimatorLayer("Motion", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .addAnimatorLayer("Drag", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .build();
        app.stage.addChild(model);
        app.stage.addChild(model.masks);
        var animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);
        var emptyAnimation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['emptymotion'].data);
        model.animator
            .getLayer("Motion")
            .play(animation);
        app.ticker.add(function (deltaTime) {
            model.update(deltaTime);
            model.masks.update(app.renderer);
            updateParameter();
        });
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            var width = window.innerWidth;
            var height = (width / 16.0) * 9.0;
            app.view.style.width = width + "px";
            app.view.style.height = height + "px";
            app.renderer.resize(width, height);
            model.position = new PIXI.Point((width * 0.5), (height * 1.2));
            model.scale = new PIXI.Point((model.position.x * 2.2), (model.position.x * 2.2));
            model.masks.resize(app.view.width, app.view.height);
        };
        onResize();
        window.onresize = onResize;
        var param_angle_x = model.parameters.ids.indexOf("PARAM_ANGLE_X");
        if (param_angle_x < 0) {
            param_angle_x = model.parameters.ids.indexOf("ParamAngleX");
        }
        var param_angle_y = model.parameters.ids.indexOf("PARAM_ANGLE_Y");
        if (param_angle_y < 0) {
            param_angle_y = model.parameters.ids.indexOf("ParamAngleY");
        }
        var param_body_angle_x = model.parameters.ids.indexOf("PARAM_BODY_ANGLE_X");
        if (param_body_angle_x < 0) {
            param_body_angle_x = model.parameters.ids.indexOf("ParamBodyAngleX");
        }
        var param_eye_ball_x = model.parameters.ids.indexOf("PARAM_EYE_BALL_X");
        if (param_eye_ball_x < 0) {
            param_eye_ball_x = model.parameters.ids.indexOf("ParamEyeBallX");
        }
        var param_eye_ball_y = model.parameters.ids.indexOf("PARAM_EYE_BALL_Y");
        if (param_eye_ball_y < 0) {
            param_eye_ball_y = model.parameters.ids.indexOf("ParamEyeBallY");
        }
        var pos_x = 0.0;
        var pos_y = 0.0;
        var onDragEnd = function (event) {
            pos_x = 0.0;
            pos_y = 0.0;
        };
        var onDragMove = function (event) {
            var mouse_x = model.position.x - event.offsetX;
            var mouse_y = model.position.y - event.offsetY;
            var height = app.screen.height / 2;
            var width = app.screen.width / 2;
            var scale = 1.0 - (height / model.scale.y);
            pos_x = -mouse_x / height;
            pos_y = -(mouse_y / width) + scale;
        };
        app.view.addEventListener('pointerup', onDragEnd, false);
        app.view.addEventListener('pointerout', onDragEnd, false);
        app.view.addEventListener('pointermove', onDragMove, false);
        var updateParameter = function () {
            emptyAnimation.evaluate = function (time, weight, blend, target) {
                if (param_angle_x >= 0) {
                    target.parameters.values[param_angle_x] =
                        blend(target.parameters.values[param_angle_x], pos_x * 30, 0, weight);
                }
                if (param_angle_y >= 0) {
                    target.parameters.values[param_angle_y] =
                        blend(target.parameters.values[param_angle_y], -pos_y * 30, 0, weight);
                }
                if (param_body_angle_x >= 0) {
                    target.parameters.values[param_body_angle_x] =
                        blend(target.parameters.values[param_body_angle_x], pos_x * 10, 0, weight);
                }
                if (param_eye_ball_x >= 0) {
                    target.parameters.values[param_eye_ball_x] =
                        blend(target.parameters.values[param_eye_ball_x], pos_x, 0, weight);
                }
                if (param_eye_ball_y >= 0) {
                    target.parameters.values[param_eye_ball_y] =
                        blend(target.parameters.values[param_eye_ball_y], -pos_y, 0, weight);
                }
            };
            model.animator.getLayer("Drag").play(emptyAnimation);
        };
    });
})(pixilookatmouse || (pixilookatmouse = {}));
