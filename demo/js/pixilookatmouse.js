var pixilookatmouse;
(function (pixilookatmouse) {
    /* ctracker */
    var ctrack = new clm.tracker()
    ctrack.init()
    /* 輪郭表示 */
    var overlay = document.getElementById('overlay')
    var overlayCC = overlay.getContext('2d')
    function drawLoop() {
        requestAnimationFrame(drawLoop)  // requestAnimFrame, renamed by PIXI.js
        overlayCC.clearRect(0, 0, 400, 300)
        if (ctrack.getCurrentPosition()) {
            ctrack.draw(overlay)
        }
    }

    /* webcam 動画周り */
    if (window.location.protocol == "file:") {
        alert("You seem to be running this example directly from a file. Note that these examples only work when served from a server or localhost due to canvas cross-domain restrictions.");
    } else if (window.location.hostname !== "localhost" && window.location.protocol !== "https:"){
        // window.location.protocol = "https";
    }
    var video = document.getElementById('videoel')
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(function(e) { console.error(e) });
    } else if (navigator.getUserMedia) {
        navigator.getUserMedia({video : true}, gumSuccess, function(e) { console.error(e) });
    } else {
        alert("Your browser does not seem to support getUserMedia");
    }
    var vid_width = video.width;
    var vid_height = video.height;
    function adjustVideoProportions() {
        // resize overlay and video if proportions of video are not 4:3
        // keep same height, just change width
        var proportion = video.videoWidth/video.videoHeight;
        vid_width = Math.round(vid_height * proportion);
        video.width = vid_width;
        overlay.width = vid_width;
    }
    function gumSuccess (stream) {
        if ("srcObject" in video) {
            video.srcObject = stream;
        } else {
            video.src = (window.URL && window.URL.createObjectURL(stream));
        }
        video.onloadedmetadata = function () {
            adjustVideoProportions();
            video.play()
            ctrack.start(video)
            drawLoop()
        }
    }

    function positionConverter(cP) {
        // input  cP: clmtracker input by ctracker.getCurrentPosition()
        // output lP: live2d format
        lP = {}

    }

    /* debugボタン */
    var button = document.getElementById('debug')
    var debugArea = document.getElementById('debug-area')
    var isDebugging = false
    button.addEventListener('click', function () {
        console.log('clicked')
        isDebugging = !isDebugging
        if(isDebugging) {
            debugArea.style.display = 'block'
        } else {
            debugArea.style.display = 'none'
        }
    })



    /* PIXI処理 */
    PIXI.loader
        .add('moc', "./assets/haru/haru.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
        .add('texture00', "./assets/haru/haru.1024/texture_00.png")
        .add('texture01', "./assets/haru/haru.1024/texture_01.png")
        .add('texture02', "./assets/haru/haru.1024/texture_02.png")
        .add('physics', "./assets/haru/Physics.physics3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .add('motion', "./assets/haru/motions/haru_idle_03.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .add('emptymotion', "./assets/Common/empty.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .load(function (loader, resources) {
        var app = new PIXI.Application(window.innerWidth, window.innerHeight, { backgroundColor: 0x1099bb });
        var base = document.getElementById('base')
        base.appendChild(app.view);
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
        var X = 0
        var Y = 0
        app.ticker.add(function (deltaTime) {
            var pos = ctrack.getCurrentPosition()
            if (pos) {
                X = pos[62][0] * 2
                Y = pos[62][1] * 2
            }
            model.update(deltaTime);
            model.masks.update(app.renderer);
            updateParameter(pos);
            // model.position = new PIXI.Point(X, Y);
        });
        var onResize = function (event) {
            if (event === void 0) { event = null; }
            var width = window.innerWidth;
            var height = window.innerHeight;
            // var height = (width / 16.0) * 9.0;
            app.view.style.width = width + "px";
            app.view.style.height = height + "px";
            app.renderer.resize(width, height);
            model.position = new PIXI.Point((width * 0.5), (height * 1.3));
            // model.scale = new PIXI.Point((model.position.x * 2.2), (model.position.x * 2.2));
            model.scale = new PIXI.Point((height * 2.0), (height * 2.0));
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

            function vadd(x, y) {
                return [(x[0] + y[0]), (x[1] + y[1])]
            }
            function vsub(x, y) {
                return [(x[0] - y[0]), (x[1] - y[1])]
            }
            function vdot(x, y) {
                return [(x[0] * y[0]), (x[1] * y[1])]
            }
            function vnorm(x) {
                return Math.sqrt((x[0] ** 2) + (x[1] ** 2))
            }
            // -1 ~ 1に正規化してある
        var params = {
            ANGLE_X: 0, // 首振り
            ANGLE_Y: 0, // 頷く
            ANGLE_Z: 0, // + で 時計回り
            MOUTH: 0, // 口0:閉じてる 1:空いてる
        }
        var updateParameter = function (pos) {
            emptyAnimation.evaluate = function (time, weight, blend, target) {
                // console.log(target, pos)
                if (pos) {
                    // 顔の傾き(横)
                    var LL = vnorm(vsub(pos[62], pos[1]))
                    var LR = vnorm(vsub(pos[62], pos[13]))
                    params.ANGLE_X = (LL / (LL+LR) - 0.5) * 3
                    // 顔回転
                    var ROW = vsub(pos[0], pos[14])
                    var TAN = ROW[1] / ROW[0]
                    params.ANGLE_Z = TAN * 2

                    var MOUTHLENGTH = vnorm(vsub(pos[60], pos[57]))
                    var MOUTHH = vnorm(vsub(pos[47], pos[53]))
                    params.MOUTH = (MOUTHLENGTH) / MOUTHH - 0.1
                }
                target.parameters.values[0] =
                        blend(target.parameters.values[0], params.ANGLE_X * 30, 0, weight);
                // target.parameters.values[1] =
                        // blend(target.parameters.values[1], pos_x * 50, 0, weight);
                target.parameters.values[2] =
                        blend(target.parameters.values[2], params.ANGLE_Z * 50, 0, weight);
                target.parameters.values[20] =
                        blend(target.parameters.values[20], params.MOUTH, 0, weight);
                    /*
                if (param_eye_ball_x >= 0) {
                    target.parameters.values[param_eye_ball_x] =
                        blend(target.parameters.values[param_eye_ball_x], pos_x, 0, weight);
                }
                if (param_eye_ball_y >= 0) {
                    target.parameters.values[param_eye_ball_y] =
                        blend(target.parameters.values[param_eye_ball_y], -pos_y, 0, weight);
                }
                */
            };
            model.animator.getLayer("Drag").play(emptyAnimation);
        };
    });
})(pixilookatmouse || (pixilookatmouse = {}));
