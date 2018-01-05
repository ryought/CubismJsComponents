declare namespace PIXI.UI {

    class Stage extends PIXI.Container {
        constructor(width: number, height: number);
        minWidth: number;
        minHeight: number;
        UIChildren: any[];
        stage: any;
        interactive: boolean;
        hitArea: PIXI.Rectangle;
        initialized: boolean;
        resize(width: number, height: number):void;
        addChild<T extends DisplayObject>(child: T, ...additionalChildren: DisplayObject[]): T;
        removeChild(child: DisplayObject): DisplayObject;
    }

    class Container extends PIXI.Container {
        constructor(width: string, height: string);
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class ScrollingContainer extends PIXI.Container {
        constructor(options: any);
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class SortableList extends PIXI.Container {
        constructor(desc: any, tweenTime: any, tweenEase: any);
    }

    class Sprite extends PIXI.Container {
        constructor(t: any);
        fromFrame(frameId: any): Sprite;
        fromImage(imageUrl: any): Sprite;
        update(): void;
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class TilingSprite extends PIXI.Container {
        constructor(t: any, width: string, height: string);
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class SliceSprite extends PIXI.Container {
        constructor(texture: any, borderWidth: any, horizontalSlice: any, verticalSlice: any, tile: any);
    }

    class Slider extends PIXI.Container {
        constructor(options: any);
        top: any;
        left: any;
        width: any;
        track: any;
        handle: any;
        fill: any;
        decimals: number;
        vertical: boolean;
        value: number;
        addChild<T extends DisplayObject>(child: T, ...additionalChildren: DisplayObject[]): T;
        update(soft: any): void;
        onValueChange(val: any): void;
        onValueChange(): any;
        minValue(val: number): void;
        minValue(): number;
        maxValue(val: number): void;
        maxValue(): number;
        disabled(val: any): void;
        disabled(): any;
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class ScrollBar extends PIXI.Container {
        constructor(options: any);
    }

    class Text extends PIXI.Container {
        constructor(text: string, PIXITextStyle: any);
        top : any;
        left : any;
        horizontalAlign : any;
        value: any;
        text: any;
        baseupdate(): void;
        update(): void;
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class DynamicText extends PIXI.Container {
        constructor(text: any, options: any);
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class DynamicTextStyle extends PIXI.Container {
        constructor(parent: any);
    }

    // NOTE: Only constructor. If functions use, write definitions!
    class TextInput extends PIXI.Container {
        constructor(options: any);
    }

    class Button extends PIXI.Container {
        constructor(options: any);
        background: any;
        isHover: boolean;
        uiText: any;
        click(): void;
        focus(): void;
        blur(): void;
        initialize(): void;
        value: any;
        text: any;
        addChild<T extends DisplayObject>(child: T, ...additionalChildren: DisplayObject[]): T;
    }

    class CheckBox extends PIXI.Container {
        constructor(options: any);
        checkGroup: any;
        background: any;
        checkmark: any;
        x: any;
        y: any;
        value: any;
        checked: any;
        selectedValue: any;
        addChild<T extends DisplayObject>(child: T, ...additionalChildren: DisplayObject[]): T;
        change(val: any): void;
        click(): void;
        focus(): void;
        blur(): void;
    }
}
