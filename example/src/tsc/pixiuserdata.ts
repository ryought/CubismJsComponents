/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

namespace pixiuserdata{

// Properties.
let app: PIXI.Application;
let koharu: LIVE2DCUBISMPIXI.Model;
let message: PIXI.Text;

// Keep 16:9 ratio.
let width = window.innerWidth;
let height = (width / 16.0) * 9.0;

// Show pixi main stage.
viewMain();

// Load and add cubism model.
loadAssets()
.then(addModel)
.then(showMessageWindow)
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

function showMessageWindow(){
    // draw a rounded rectangle
    let messageWindow = new PIXI.Graphics();
    app.stage.addChild(messageWindow);

    let style = {font:'bold 24pt Arial', fill:'white'};
    message = new PIXI.Text("", style);
    messageWindow.addChild(message);

    // Do that responsive design...
    let onResize = (event: any = null) => {
        messageWindow.clear();
        messageWindow.lineStyle(4, 0xFFFFFF, 1);
        messageWindow.beginFill(0x0000FF, 0.4);
        messageWindow.drawRoundedRect(width * 0.15, height * 0.7, width * 0.7, height * 0.25, 15);
        messageWindow.endFill();

        message.position.x = width * 0.15 + 10;
        message.position.y = height * 0.7 + 5;
        message.style.fontSize = width * 0.035;
    };
    onResize();
    window.addEventListener('resize', onResize);
    
}

// Load cubism assets.
function loadAssets() {
    // Load one cubism model per one promise.
    var p1 = new Promise((resolve, reject) => {
        new PIXI.loaders.Loader()
        .add('model3', "../assets/Koharu_model3/koharu.model3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .add('motion', "../assets/Koharu_model3/01.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
            // Create model.
            new LIVE2DCUBISMPIXI.ModelBuilder().buildFromModel3Json(loader, resources['model3'], (model: LIVE2DCUBISMPIXI.Model) => {
                if(model == null)
                    reject();  
                    
                // Set Model instance.
                koharu = model;
                // Load animation.
                let animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motion'].data);
                // Add animation layer.
                koharu.animator.addLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
                // Play animation.
                koharu.animator.getLayer("base").play(animation);
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
    app.stage.addChild(koharu);
    app.stage.addChild(koharu.masks);

    // Set up ticker.
    app.ticker.add((deltaTime) => {
        koharu.update(deltaTime);
        koharu.masks.update(app.renderer);
    });
    
    // Do that responsive design...
    let onResize = (event: any = null) => {
        // Resize model.
        koharu.position = new PIXI.Point((width * 0.5), (height * 0.5));
        koharu.scale = new PIXI.Point((width * 0.4), (width * 0.4));
        // Resize mask texture.
        koharu.masks.resize(app.view.width, app.view.height);
    };
    onResize();
    window.addEventListener('resize', onResize);
}


function loadFail(){
    console.log("Load Fail");
}

}