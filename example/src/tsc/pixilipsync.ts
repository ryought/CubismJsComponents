/*
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

namespace pixilipsync{

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


        // Create WebAudio.
        let webAudio = new WebAudio(app);
        webAudio.setAudio(0, "../assets/haru/audios/haru_normal_01.mp3");
        webAudio.setAudio(1, "../assets/haru/audios/haru_normal_02.mp3");
        webAudio.setAudio(2, "../assets/haru/audios/haru_normal_03.mp3");
        webAudio.setAudio(3, "../assets/haru/audios/haru_normal_04.mp3");
        webAudio.setAudio(4, "../assets/haru/audios/haru_normal_05.mp3");


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
            .addAnimatorLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .addAnimatorLayer("lipsync", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
            .build();


        // Add model to stage.
        app.stage.addChild(model);
        app.stage.addChild(model.masks);


        // Load animation.
        let animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);
        let emptyAnimation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['emptymotion'].data);


        // Play animation.
        model.animator
            .getLayer("base")
            .play(animation);


        // Set up ticker.
        app.ticker.add((deltaTime) => {

            webAudio.visualize();

            model.update(deltaTime);
            model.masks.update(app.renderer);
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


        const onLipsync = () => {
            emptyAnimation.evaluate = (time: any, weight: any, blend: any, target: any) => {
                let param_mouth_open_y = target.parameters.ids.indexOf("PARAM_MOUTH_OPEN_Y");
                if(param_mouth_open_y < 0){
                    param_mouth_open_y = model.parameters.ids.indexOf("ParamMouthOpenY")
                }
                if (param_mouth_open_y >= 0) {
                    const volume = webAudio.getVolume();
                    target.parameters.values[param_mouth_open_y] =
                    blend(target.parameters.values[param_mouth_open_y], volume, 0, weight);
                }
            }
            model.animator.getLayer("lipsync").play(emptyAnimation);
        };
        onLipsync();


        const createPIXIUI = () => {
            let uiStage = new PIXI.UI.Stage(1280, 720);
            app.stage.addChild(uiStage);

            let uiContainer = new PIXI.UI.Container("30%", "100%");
            uiStage.addChild(uiContainer);

            let cb_bg = PIXI.Texture.fromImage("../assets/UI/grey_box.png");
            let cb_mark = PIXI.Texture.fromImage("../assets/UI/grey_checkmarkGrey.png");
            let cb_button = PIXI.Texture.fromImage("../assets/UI/grey_button01.png");

            let textStyle = { fill: ['#000000', '#000000'], fontSize: 20, fontFamily: 'Calibri', fontWeight: 'bold' };
            let textStyleMode = { fill: ['#000000', '#000000'], fontSize: 18, fontFamily: 'Calibri', fontWeight: 'bold' };


            let textVolume = new PIXI.UI.Text("Volume", textStyle);
            textVolume.top = 20;
            textVolume.left = "10%";
            uiContainer.addChild(textVolume);


            let textInputType = new PIXI.UI.Text("Input Type", textStyle);
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
                    cb.y = String(18 + 5*i) + "%";
                    cb.on("change", function (checked: any) {
                        if (checked) {
                            cb.checkmark.alpha = 1;
                            if(cb.value == "checkbox 1"){
                                webAudio.getAudioAccess();
                            }
                        }
                        else {
                            cb.checkmark.alpha = 0;
                        }
                    });
                    uiContainer.addChild(cb);

                    let text:PIXI.UI.Text;
                    if(i == 0)
                        text = new PIXI.UI.Text("audio file Input", textStyleMode);
                    else if(i == 1)
                        text = new PIXI.UI.Text("microphone input", textStyleMode);
                    text.x = cb.width + 3;
                    text.y = 5;
                    cb.addChild(text);
                })();
            }

            let buttonNextAudio = new PIXI.Sprite(cb_button);
            buttonNextAudio.x = 40;
            buttonNextAudio.y = 220;
            buttonNextAudio.interactive = true;
            buttonNextAudio.buttonMode = true;
            buttonNextAudio.on('pointerdown', () => {
                webAudio.nextPlay();
            });
            app.stage.addChild(buttonNextAudio);

            let textNextAudio = new PIXI.Text('Next Audio Play', textStyle);
            textNextAudio.x = 60;
            textNextAudio.y = 230;
            app.stage.addChild(textNextAudio);
        };
        createPIXIUI();

    });


declare let webkitAudioContext: any;

class WebAudio {
    private _audioNames: string[] = [];
    private _audioCtx: AudioContext;
    private _soundSource: AudioBufferSourceNode;    // For audio file
    private _sourceNode: MediaStreamAudioSourceNode; // For microphone input
    private _analyser: AnalyserNode;
    private _bufferLengthAlt: number;
    private _dataArrayAlt: Uint8Array;
    private _audioCanvas: HTMLCanvasElement;
    private _audioCanvasCtx: CanvasRenderingContext2D;
    private _volume: number = 0;
    private _microphoneMode: boolean = false;
    private _spriteVolume: PIXI.Sprite;
    private _nextIndex: number = 0;


    constructor(app: PIXI.Application){
        let _AudioContext = AudioContext || webkitAudioContext;
        this._audioCtx = new _AudioContext();
        this.initCanvas();
        this.drawVolumeUI(app);
    }


    initCanvas(){
        // Visualize canvas
        this._audioCanvas = <HTMLCanvasElement>document.createElement("canvas");
        this._audioCanvas.id = "visualizer";
        this._audioCanvas.width = 255;
        this._audioCanvas.height = 38;
        this._audioCanvasCtx = this._audioCanvas.getContext("2d");
        this._audioCanvasCtx.clearRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
        this._audioCanvasCtx.fillStyle = "rgb(0, 0, 0)";
        this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
    }


    drawVolumeUI(app: PIXI.Application){
        this._spriteVolume = new PIXI.Sprite(PIXI.Texture.fromCanvas(this._audioCanvas));
        this._spriteVolume.x = 40;
        this._spriteVolume.y = 50;
        app.stage.addChild(this._spriteVolume);
    }


    setAudio(index: number, audioName: string){
        this._audioNames[index] = audioName;
    }


    play(index: number){
        fetch(this._audioNames[index]).then(response => {
            return response.arrayBuffer();
        }).then((arraybuffer) => {
            return this._audioCtx.decodeAudioData(arraybuffer);
        }).then((buffer) => {
            this.playSound(buffer);
        });
    }

    nextPlay(){
        if(this._nextIndex >= this._audioNames.length){
            this._nextIndex = 0;
        }
        this.play(this._nextIndex);
        this._nextIndex++;
    }

    getAudioAccess(){
        this._microphoneMode = true;

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
            }).then(stream => {
            this._sourceNode = this._audioCtx.createMediaStreamSource(stream);

            this._analyser = this._audioCtx.createAnalyser();
            this._bufferLengthAlt = this._analyser.fftSize;
            this._dataArrayAlt = new Uint8Array(this._bufferLengthAlt);

            this._sourceNode.connect(this._analyser);
            }).catch(error => {
                console.log(error);
            });
    }

    playSound(buffer: AudioBuffer) {
        this._soundSource = this._audioCtx.createBufferSource();
        this._soundSource.buffer = buffer;

        this._analyser = this._audioCtx.createAnalyser();
        this._bufferLengthAlt = this._analyser.frequencyBinCount;
        this._dataArrayAlt = new Uint8Array(this._bufferLengthAlt);

        this._soundSource.connect(this._analyser);
        this._analyser.connect(this._audioCtx.destination);

        this._soundSource.start();
    }


    visualize() {
        if(this._analyser == null) return;

        this._analyser.getByteFrequencyData(this._dataArrayAlt);

        this._audioCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
        this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);

        let barWidth = 0;
        let barHeight = 0;

        if(this._microphoneMode)
        {
            barHeight = (this._audioCanvas.width / this._bufferLengthAlt) * 300.0;
        } else{
            barHeight = (this._audioCanvas.width / this._bufferLengthAlt) * 150.0;
        }

        let maxValue = 0;

        for (let i = 0; i < this._bufferLengthAlt; i++) {
            barWidth = this._dataArrayAlt[i]; // value = 0 ~ 255

            maxValue = maxValue > barWidth ? maxValue: barWidth;
            this._volume = maxValue / 255;

            this._audioCanvasCtx.fillStyle = 'rgb(' + (barWidth + 100) + ',50, 50)';
            this._audioCanvasCtx.fillRect(0, 0, barWidth, barHeight);
        }

        this._spriteVolume.texture.update();
    }


    getVolume(){
        return this._volume;
    }


    stop(){
        this._soundSource.stop();
    }


}
}