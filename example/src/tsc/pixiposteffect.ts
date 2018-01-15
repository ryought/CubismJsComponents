/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */
namespace pixiposteffect {

// Properties.
let app: PIXI.Application;
let koharu: LIVE2DCUBISMPIXI.Model;
let mark: LIVE2DCUBISMPIXI.Model;
let count = 0.0;

// Keep 16:9 ratio.
let width = window.innerWidth;
let height = (width / 16.0) * 9.0;

// Show pixi main stage.
viewMain();

// Load and add cubism model.
loadAssets()
.then(addModel)
.then(addFilter)
.catch(loadFail);


function viewMain(){
    // Create app.
    app = new PIXI.Application(1280, 720, {backgroundColor : 0x1099bb});
    
    document.body.appendChild(app.view);

    // Set background image
    var bgTexture = PIXI.Texture.fromImage('../assets/background.png');
    // new sprite
    var background = new PIXI.Sprite(bgTexture);
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

                resolve();
            });

        });
    });

    // Load one cubism model per one promise.
    var p2 = new Promise((resolve, reject) => { 
        new PIXI.loaders.Loader()
        .add('model3', "../assets/Mark/Mark.model3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .add('motion', "../assets/Mark/Mark.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON })
        .load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
            // Create model.
            new LIVE2DCUBISMPIXI.ModelBuilder().buildFromModel3Json(loader, resources['model3'], (model: LIVE2DCUBISMPIXI.Model) => {
                if(model == null)
                    reject();

                // Set Model instance.
                mark = model;
                // Load animation.
                let animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(loader.resources['motion'].data);
                // Add animation layer.
                mark.animator.addLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
                // Play animation.
                mark.animator.getLayer("base").play(animation);

                resolve();
            });
        }); 
    });

    // When all promise ended, will return.
    return Promise.all([p1, p2]);
}


function addModel() {

    // Add model to stage.
    app.stage.addChild(koharu);
    app.stage.addChild(koharu.masks);

    // Add model to stage.
    app.stage.addChild(mark);
    app.stage.addChild(mark.masks);

    // Set up ticker.
    app.ticker.add((deltaTime) => {
        koharu.update(deltaTime);
        koharu.masks.update(app.renderer);
        
        mark.update(deltaTime);
        mark.masks.update(app.renderer);
    });
    
    // Do that responsive design...
    let onResize = (event: any = null) => {
        // Resize model.
        koharu.position = new PIXI.Point((width * 0.25), (height * 0.5));
        koharu.scale = new PIXI.Point((width * 0.4), (width * 0.4));
        // Resize mask texture.
        koharu.masks.resize(app.view.width, app.view.height);

        // Resize model.
        mark.position = new PIXI.Point((width * 0.75), (height * 0.5));
        mark.scale = new PIXI.Point((width * 0.4), (width * 0.4));
        // Resize mask texture.
        mark.masks.resize(app.view.width, app.view.height);
    };
    onResize();
    window.addEventListener('resize', onResize);
}

function addFilter(){
    let Filter1 = new PIXI.filters.BlurFilter();
    let Filter2 = new PIXI.filters.ColorMatrixFilter();

    koharu.filters = [Filter1];
    mark.filters = [Filter2];

    // Set up ticker.
    app.ticker.add((deltaTime) => {
        count += 0.03;

        let blurAmount = Math.cos(count / 2);
        Filter1.blur = 20 * (blurAmount);

        let matrix = Filter2.matrix;
        matrix[1] = Math.sin(count) * 3;
        matrix[2] = Math.cos(count);
        matrix[3] = Math.cos(count) * 1.5;
        matrix[4] = Math.sin(count / 3) * 2;
        matrix[5] = Math.sin(count / 2);
        matrix[6] = Math.sin(count / 4);
    });
}

function loadFail(){
    console.log("Load Fail");
}

}