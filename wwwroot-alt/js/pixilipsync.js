var pixilipsync;
(function (pixilipsync) {
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
        var webAudio = new WebAudio(app);
        webAudio.setAudio(0, "../assets/haru/audios/haru_normal_01.mp3");
        webAudio.setAudio(1, "../assets/haru/audios/haru_normal_02.mp3");
        webAudio.setAudio(2, "../assets/haru/audios/haru_normal_03.mp3");
        webAudio.setAudio(3, "../assets/haru/audios/haru_normal_04.mp3");
        webAudio.setAudio(4, "../assets/haru/audios/haru_normal_05.mp3");
        var moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(resources['moc'].data);
        var model = new LIVE2DCUBISMPIXI.ModelBuilder()
            .setMoc(moc)
            .setTimeScale(1)
            .addTexture(0, resources['texture00'].texture)
            .addTexture(1, resources['texture01'].texture)
            .addTexture(2, resources['texture02'].texture)
            .setPhysics3Json(resources['physics'].data)
            .addAnimatorLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .addAnimatorLayer("lipsync", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .build();
        app.stage.addChild(model);
        app.stage.addChild(model.masks);
        var animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);
        var emptyAnimation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['emptymotion'].data);
        model.animator
            .getLayer("base")
            .play(animation);
        app.ticker.add(function (deltaTime) {
            webAudio.visualize();
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
            model.position = new PIXI.Point((width * 0.5), (height * 1.2));
            model.scale = new PIXI.Point((model.position.x * 2.2), (model.position.x * 2.2));
            model.masks.resize(app.view.width, app.view.height);
        };
        onResize();
        window.onresize = onResize;
        var onLipsync = function () {
            emptyAnimation.evaluate = function (time, weight, blend, target) {
                var param_mouth_open_y = target.parameters.ids.indexOf("PARAM_MOUTH_OPEN_Y");
                if (param_mouth_open_y < 0) {
                    param_mouth_open_y = model.parameters.ids.indexOf("ParamMouthOpenY");
                }
                if (param_mouth_open_y >= 0) {
                    var volume = webAudio.getVolume();
                    target.parameters.values[param_mouth_open_y] =
                        blend(target.parameters.values[param_mouth_open_y], volume, 0, weight);
                }
            };
            model.animator.getLayer("lipsync").play(emptyAnimation);
        };
        onLipsync();
        var createPIXIUI = function () {
            var uiStage = new PIXI.UI.Stage(1280, 720);
            app.stage.addChild(uiStage);
            var uiContainer = new PIXI.UI.Container("30%", "100%");
            uiStage.addChild(uiContainer);
            var cb_bg = PIXI.Texture.fromImage("../assets/UI/grey_box.png");
            var cb_mark = PIXI.Texture.fromImage("../assets/UI/grey_checkmarkGrey.png");
            var cb_button = PIXI.Texture.fromImage("../assets/UI/grey_button01.png");
            var textStyle = { fill: ['#000000', '#000000'], fontSize: 20, fontFamily: 'Calibri', fontWeight: 'bold' };
            var textStyleMode = { fill: ['#000000', '#000000'], fontSize: 18, fontFamily: 'Calibri', fontWeight: 'bold' };
            var textVolume = new PIXI.UI.Text("Volume", textStyle);
            textVolume.top = 20;
            textVolume.left = "10%";
            uiContainer.addChild(textVolume);
            var textInputType = new PIXI.UI.Text("Input Type", textStyle);
            textInputType.top = 100;
            textInputType.left = "10%";
            uiContainer.addChild(textInputType);
            for (var i = 0; i < 2; i++) {
                (function () {
                    var cb = new PIXI.UI.CheckBox({
                        checked: i === 0,
                        background: new PIXI.UI.Sprite(cb_bg),
                        checkmark: new PIXI.UI.Sprite(cb_mark),
                        checkgroup: "motionA",
                        value: "checkbox " + i
                    });
                    cb.width = 25;
                    cb.height = 25;
                    cb.checkmark.width = cb.width - 8;
                    cb.checkmark.height = cb.height - 8;
                    cb.x = "10%";
                    cb.y = String(18 + 5 * i) + "%";
                    cb.on("change", function (checked) {
                        if (checked) {
                            cb.checkmark.alpha = 1;
                            if (cb.value == "checkbox 1") {
                                webAudio.getAudioAccess();
                            }
                        }
                        else {
                            cb.checkmark.alpha = 0;
                        }
                    });
                    uiContainer.addChild(cb);
                    var text;
                    if (i == 0)
                        text = new PIXI.UI.Text("audio file Input", textStyleMode);
                    else if (i == 1)
                        text = new PIXI.UI.Text("microphone input", textStyleMode);
                    text.x = cb.width + 3;
                    text.y = 5;
                    cb.addChild(text);
                })();
            }
            var buttonNextAudio = new PIXI.Sprite(cb_button);
            buttonNextAudio.x = 40;
            buttonNextAudio.y = 220;
            buttonNextAudio.interactive = true;
            buttonNextAudio.buttonMode = true;
            buttonNextAudio.on('pointerdown', function () {
                webAudio.nextPlay();
            });
            app.stage.addChild(buttonNextAudio);
            var textNextAudio = new PIXI.Text('Next Audio Play', textStyle);
            textNextAudio.x = 60;
            textNextAudio.y = 230;
            app.stage.addChild(textNextAudio);
        };
        createPIXIUI();
    });
    var WebAudio = (function () {
        function WebAudio(app) {
            this._audioNames = [];
            this._volume = 0;
            this._microphoneMode = false;
            this._nextIndex = 0;
            var _AudioContext = AudioContext || webkitAudioContext;
            this._audioCtx = new _AudioContext();
            this.initCanvas();
            this.drawVolumeUI(app);
        }
        WebAudio.prototype.initCanvas = function () {
            this._audioCanvas = document.createElement("canvas");
            this._audioCanvas.id = "visualizer";
            this._audioCanvas.width = 255;
            this._audioCanvas.height = 38;
            this._audioCanvasCtx = this._audioCanvas.getContext("2d");
            this._audioCanvasCtx.clearRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
            this._audioCanvasCtx.fillStyle = "rgb(0, 0, 0)";
            this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
        };
        WebAudio.prototype.drawVolumeUI = function (app) {
            this._spriteVolume = new PIXI.Sprite(PIXI.Texture.fromCanvas(this._audioCanvas));
            this._spriteVolume.x = 40;
            this._spriteVolume.y = 50;
            app.stage.addChild(this._spriteVolume);
        };
        WebAudio.prototype.setAudio = function (index, audioName) {
            this._audioNames[index] = audioName;
        };
        WebAudio.prototype.play = function (index) {
            var _this = this;
            fetch(this._audioNames[index]).then(function (response) {
                return response.arrayBuffer();
            }).then(function (arraybuffer) {
                return _this._audioCtx.decodeAudioData(arraybuffer);
            }).then(function (buffer) {
                _this.playSound(buffer);
            });
        };
        WebAudio.prototype.nextPlay = function () {
            if (this._nextIndex >= this._audioNames.length) {
                this._nextIndex = 0;
            }
            this.play(this._nextIndex);
            this._nextIndex++;
        };
        WebAudio.prototype.getAudioAccess = function () {
            var _this = this;
            this._microphoneMode = true;
            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            }).then(function (stream) {
                _this._sourceNode = _this._audioCtx.createMediaStreamSource(stream);
                _this._analyser = _this._audioCtx.createAnalyser();
                _this._bufferLengthAlt = _this._analyser.fftSize;
                _this._dataArrayAlt = new Uint8Array(_this._bufferLengthAlt);
                _this._sourceNode.connect(_this._analyser);
            }).catch(function (error) {
                console.log(error);
            });
        };
        WebAudio.prototype.playSound = function (buffer) {
            this._soundSource = this._audioCtx.createBufferSource();
            this._soundSource.buffer = buffer;
            this._analyser = this._audioCtx.createAnalyser();
            this._bufferLengthAlt = this._analyser.frequencyBinCount;
            this._dataArrayAlt = new Uint8Array(this._bufferLengthAlt);
            this._soundSource.connect(this._analyser);
            this._analyser.connect(this._audioCtx.destination);
            this._soundSource.start();
        };
        WebAudio.prototype.visualize = function () {
            if (this._analyser == null)
                return;
            this._analyser.getByteFrequencyData(this._dataArrayAlt);
            this._audioCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
            this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
            var barWidth = 0;
            var barHeight = 0;
            if (this._microphoneMode) {
                barHeight = (this._audioCanvas.width / this._bufferLengthAlt) * 300.0;
            }
            else {
                barHeight = (this._audioCanvas.width / this._bufferLengthAlt) * 150.0;
            }
            var maxValue = 0;
            for (var i = 0; i < this._bufferLengthAlt; i++) {
                barWidth = this._dataArrayAlt[i];
                maxValue = maxValue > barWidth ? maxValue : barWidth;
                this._volume = maxValue / 255;
                this._audioCanvasCtx.fillStyle = 'rgb(' + (barWidth + 100) + ',50, 50)';
                this._audioCanvasCtx.fillRect(0, 0, barWidth, barHeight);
            }
            this._spriteVolume.texture.update();
        };
        WebAudio.prototype.getVolume = function () {
            return this._volume;
        };
        WebAudio.prototype.stop = function () {
            this._soundSource.stop();
        };
        return WebAudio;
    }());
})(pixilipsync || (pixilipsync = {}));
