/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */


namespace LIVE2DCUBISMFRAMEWORK {
    /** Cubism animation point. */
    export class AnimationPoint {
        /**
         * Initializes point.
         * 
         * @param time Timing.
         * @param value Value at time.
         */
        public constructor(public time: number, public value: number) {}
    }


    /** Cubism animation segment evaluator. */
    export interface IAnimationSegmentEvaluator {
        /**
         * Evaluates segment.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        (points: Array<AnimationPoint>, offset: number, time: number): number;
    }


    /** Builtin Cubism animation segment evaluators. */
    export class BuiltinAnimationSegmentEvaluators {
        /**
         * Linear segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        public static LINEAR: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            let p0 = points[offset + 0];
            let p1 = points[offset + 1];
            let t = (time - p0.time) / (p1.time - p0.time);


            return (p0.value + ((p1.value - p0.value) * t));
        }

        /**
         * Bézier segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        public static BEZIER: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            let t = (time - points[offset + 0].time) / (points[offset + 3].time - points[offset].time);


            let p01 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 0], points[offset + 1], t);
            let p12 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 1], points[offset + 2], t);
            let p23 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 2], points[offset + 3], t);

            let p012 = BuiltinAnimationSegmentEvaluators.lerp(p01, p12, t);
            let p123 = BuiltinAnimationSegmentEvaluators.lerp(p12, p23, t);


            return BuiltinAnimationSegmentEvaluators.lerp(p012, p123, t).value;
        }

        /**
         * Stepped segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluationr result.
         */
        public static STEPPED: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            return points[offset + 0].value;
        }

        /**
         * Inverse-stepped segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluationr result.
         */
        public static INVERSE_STEPPED: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            return points[offset + 1].value;
        }


        /**
         * Interpolates points.
         * 
         * @param a First point.
         * @param b Second point.
         * @param t Weight.
         * 
         * @return Interpolation result.
         */
        private static lerp(a: AnimationPoint, b: AnimationPoint, t: number): AnimationPoint {

              return new AnimationPoint((a.time + ((b.time - a.time) * t)), (a.value + ((b.value - a.value) * t)));
        }
    }


    /** Cubism animation track segment. */
    export class AnimationSegment {
        /**
         * Initializes instance.
         *
         * @param offset Offset into points.
         * @param evaluate Evaluator.
         */
        public constructor(public offset: number, public evaluate: IAnimationSegmentEvaluator) {}
    }


    /** Cubism animation track. */
    export class AnimationTrack {
        /**
         * Initializes instance.
         * 
         * @param targetId Target ID.
         * @param points Points.
         * @param segments Segments.
         */
        public constructor(public targetId: string, public points: Array<AnimationPoint>, public segments: Array<AnimationSegment>) {}
        

        /**
         * Evaluates track
         * 
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        public evaluate(time: number): number {
            // Find segment to evaluate.
            let s = 0;
            let lastS = this.segments.length - 1;


            for(; s < lastS; ++s) {
                if (this.points[this.segments[s + 1].offset].time < time) {
                    continue;
                }


                break;
            }


            // Evaluate segment.
            // TODO Passing segment offset somewhat to itself is awkward. Improve it.
            return this.segments[s].evaluate(this.points, this.segments[s].offset, time);
        }
    }


    /** Cubism animation. */
    export class Animation {
        /**
         * Deserializes animation from model3.json.
         * 
         * @param model3Json Parsed model3.json
         * 
         * @return Animation on success; 'null' otherwise. 
         */
        public static fromMotion3Json(model3Json: any): Animation {
            if (model3Json == null) {
                return null;
            }


            let animation = new Animation(model3Json);


            return (animation.isValid)
                ? animation
                : null;
        }


        /** Duration (in seconds). */
        public duration: number;

        /** Fps. */
        public fps: number;

        /** Loop control. */
        public loop: boolean;

        /** Model tracks. */
        public modelTracks: Array<AnimationTrack> = new Array<AnimationTrack>();

        /** Parameter tracks. */
        public parameterTracks: Array<AnimationTrack> = new Array<AnimationTrack>();

        /** Part opacity tracks. */
        public partOpacityTracks: Array<AnimationTrack> = new Array<AnimationTrack>();


        /**
         * Evaluates animation.
         * 
         * @param time Time. 
         * @param weight Weight.
         * @param blend Blender.
         * @param target Target.
         */
        public evaluate(time: number, weight: number, blend: IAnimationBlender, target: LIVE2DCUBISMCORE.Model): void {
            // Return early if influence is miminal.
            if (weight <= 0.01) {
                return;
            }


            // Loop animation time if requested.
            if (this.loop) {
                while (time > this.duration) {
                    time -= this.duration;
                }
            }


            // Evaluate tracks and apply results.
            this.parameterTracks.forEach((t) => {
                let p = target.parameters.ids.indexOf(t.targetId);


                if (p >= 0) {
                    let sample = t.evaluate(time);


                    target.parameters.values[p] = blend(target.parameters.values[p], sample, weight);
                }
            });


            this.partOpacityTracks.forEach((t) => {
                let p = target.parts.ids.indexOf(t.targetId);


                if (p >= 0) {
                    let sample = t.evaluate(time);


                    target.parts.opacities[p] = blend(target.parts.opacities[p], sample, weight);
                }
            });
            
            
            // TODO Evaluate model tracks.
        }


        /** 'true' if instance is valid; 'false' otherwise. */
        private get isValid(): boolean {
            return true;
        }


        /**
         * Creates instance.
         * 
         * @param model3Json Parsed model3.json.
         */
        private constructor(model3Json: any) {
            // Deserialize meta.
            this.duration = model3Json['Meta']['Duration'];
            this.fps = model3Json['Meta']['Fps'];
            this.loop = model3Json['Meta']['Loop'];


            // Deserialize tracks.
            model3Json['Curves'].forEach((c: any) => {
                // Deserialize segments.
                let s = c['Segments'];


                let points = new Array<AnimationPoint>();
                let segments = new Array<AnimationSegment>();


                points.push(new AnimationPoint(s[0], s[1]));


                for (var t = 2; t < s.length; t += 3) {
                    let offset = points.length - 1;
                    let evaluate = BuiltinAnimationSegmentEvaluators.LINEAR;
                    
            
                    // Handle segment types.
                    let type = s[t];

                    if (type == 1) {
                        evaluate = BuiltinAnimationSegmentEvaluators.BEZIER;


                        points.push(new AnimationPoint(s[t + 1], s[t + 2]));
                        points.push(new AnimationPoint(s[t + 3], s[t + 4]));


                        t += 4;
                    }
                    else if (type == 2) {
                        evaluate = BuiltinAnimationSegmentEvaluators.STEPPED;
                    }
                    else if (type == 3) {
                        evaluate = BuiltinAnimationSegmentEvaluators.INVERSE_STEPPED;
                    }
                    else if (type != 0) {
                        // TODO Handle unexpected segment type.
                    }


                    // Push segment and point.
                    points.push(new AnimationPoint(s[t + 1], s[t + 2]));
                    segments.push(new AnimationSegment(offset, evaluate));
                }


                // Create track.
                let track = new AnimationTrack(c['Id'], points, segments);


                // Push track.
                if (c['Target'] == 'Model') {
                    this.modelTracks.push(track);
                }
                else if (c['Target'] == 'Parameter') {
                    this.parameterTracks.push(track);
                }
                else if (c['Target'] == 'PartOpacity') {
                    this.partOpacityTracks.push(track);
                }
                else {
                    // TODO Handle unexpected target.
                }
            });
        }
    }


    /** Cubism animation cross-fade weighter. */
    export interface IAnimationCrossfadeWeighter {
        /**
         * Weights crossfade.
         * 
         * @param time Current fade time.
         * @param duration Total fade duration.
         * 
         * @return Normalized source weight. (Destination will be weight as (1 - source weight)).
         */
        (time: number, duration: number): number;
    }


    /** Builtin Cubims crossfade  */
    export class BuiltinCrossfadeWeighters {
        /**
         * Linear crossfade weighter.
         *  
         * @param time Current fade time.
         * @param duration Total fade duration.
         * 
         * @return Normalized source weight. (Destination will be weight as (1 - source weight)).
         */
        public static LINEAR(time: number, duration: number): number {
            return (time / duration);
        } 
    }


    /** Cubism animation state. */
    export class AnimationState {
        /** Time. */
        public time: number;
    }


    /** Cubism animation layer blender. */
    export interface IAnimationBlender {
        /**
         * Blends.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        (source: number, destination: number, weight: number): number;
    }


    /** Builtin Cubism animation layer blenders. */
    export class BuiltinAnimationBlenders {
        /**
         * Override blender.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        public static OVERRIDE: IAnimationBlender = function(source: number, destination: number, weight: number): number {
            return (destination * weight);
        }

        /**
         * Additive blender.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        public static ADD: IAnimationBlender = function(source: number, destination: number, weight: number): number {
            return (source + (destination * weight));
        }

        /**
         * Multiplicative blender.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        public static MULTIPLY: IAnimationBlender = function(source: number, destination: number, weight: number): number {
            return (source * (1 + ((destination - 1) * weight)));
        }
    }


    /** Cubism animation layer. */
    export class AnimationLayer {
        /** Current animation. */
        public get currentAnimation(): Animation {
            return this._animation;
        }

        /** Current time. */
        public get currentTime(): number {
            return this._time;
        }
        public set currentTime(value: number) {
            this._time = value;
        }

        /** Blender. */
        public blend: IAnimationBlender;

        /** Crossfade weighter. */
        public weightCrossfade: IAnimationCrossfadeWeighter;

        /** Normalized weight. */
        public weight: number = 1;

        /** 'true' if layer is playing; 'false' otherwise. */
        public get isPlaying(): boolean {
            return this._play;
        }


        /**
         * Starts playing animation.
         *
         * @param animation Animation to play.
         */
        public play(animation: Animation, fadeDuration: number = 0): void {
            if (fadeDuration > 0) {
                this._goalAnimation = animation;
                this._goalTime = 0;

                this._fadeTime = 0;
                this._fadeDuration = fadeDuration;
            }
            else {
                this._animation = animation;
                this._play = true;
                this.currentTime = 0;
            }
        }

        /** Pauses playback (preserving time). */
        public pause(): void {
            this._play = false;
        }

        /** Resumes playback. */
        public resume(): void {
            this._play = true;
        }

        /** Stops playback (resetting time). */
        public stop(): void {
            this._play = false;
            this.currentTime = 0
        }


        /** Current animation. */
        private _animation: Animation;

        /** Time of current animation. */
        private _time: number;

        /** Goal animation. */
        private _goalAnimation: Animation;

        /** Goal animation time. */
        private _goalTime: number;

        /** Crossfade time. */
        private _fadeTime: number;

        /** Crossfade duration. */
        private _fadeDuration: number;

        /** Controls playback. */
        private _play: boolean;


        /**
         * Ticks layer.
         *
         * @param deltaTime Time delta.
         */
        public _update(deltaTime: number): void {
            // Return if not playing.
            if (!this._play) {
                return;
            }


            // Progress time if playing.
            this._time += deltaTime;
            this._goalTime += deltaTime;
            this._fadeTime += deltaTime;
        }

        /**
         * Evaluates layer and applies results to target.
         * 
         * @param target Target.
         */
        public _evaluate(target: LIVE2DCUBISMCORE.Model): void {
            // Return if evaluation isn't possible.
            if (this._animation == null) {
                return;
            }


            // Clamp weight.
            let weight = (this.weight < 1)
                ? this.weight
                : 1;


            // Evaluate current animation.
            let animationWeight = (this._goalAnimation != null)
                ? (weight * this.weightCrossfade(this._fadeTime, this._fadeDuration))
                : weight;


            this._animation.evaluate(this._time, animationWeight, this.blend, target);


            // Evaluate goal animation.
            if (this._goalAnimation != null) {
                animationWeight = 1 - (weight * this.weightCrossfade(this._fadeTime, this._fadeDuration));


                this._goalAnimation.evaluate(this._goalTime, animationWeight, this.blend, target);


                // Finalize crossfade.
                if (this._fadeTime > this._fadeDuration) {
                    this._animation = this._goalAnimation;
                    this._time = this._goalTime;
                    this._goalAnimation = null;
                }
            }
        }
    }


    /** Cubism animator. */
    export class Animator {
        /** Target model. */
        public get target(): LIVE2DCUBISMCORE.Model {
            return this._target;
        }

        /** Time scale. */
        public timeScale: number;


        /**
         * Gets layer by name.
         *
         * @param name Name.
         * 
         * @return Animation layer if found; 'null' otherwise.
         */
        public getLayer(name: string): AnimationLayer {
            return this._layers.has(name)
                ? this._layers.get(name)
                : null;
        }


        /** Evaluates animation layers and applies results to target. */
        public update(deltaTime: number): void {
            // Scale delta time.
            deltaTime *= ((this.timeScale > 0)
                ? this.timeScale
                : 0);


            // Tick and evaluate layers.
            this._layers.forEach((l) => {
                l._update(deltaTime);
                l._evaluate(this._target);
            });
        }


        /**
         * Creates animator.
         * 
         * @param target Target.
         * 
         * @return Animator on success; 'null' otherwise.
         */
        public static _create(target: LIVE2DCUBISMCORE.Model, timeScale: number, layers: Map<string, AnimationLayer>): Animator {
            let animator = new Animator(target, timeScale,layers);


            return animator.isValid
                ? animator
                : null;
        }


        /** Target. */
        private _target: LIVE2DCUBISMCORE.Model;

        /** Layers. */
        private _layers: Map<string, AnimationLayer>;

        /** 'true' if instance is valid; 'false' otherwise. */
        private get isValid(): boolean {
            return this._target != null;
        }


        /**
         * Creates instance.
         * 
         * @param target Target.
         * @param timeScale Time scale.
         * @param layers Layers.
         */
        private constructor(target: LIVE2DCUBISMCORE.Model, timeScale: number, layers: Map<string, AnimationLayer>) {
            this._target = target;
            this.timeScale = timeScale;
            this._layers = layers;
        }
    }


    /** Cubism [[Animator]] builder. */
    export class AnimatorBuilder {
        /**
         * Sets target model.
         *
         * @param value Target.
         * 
         * @return Builder.
         */
        public setTarget(value: LIVE2DCUBISMCORE.Model): AnimatorBuilder {
            this._target = value;


            return this;
        }

        /**
         * Sets time scale.
         *
         * @param value Time scale.
         * 
         * @return Builder.
         */
        public setTimeScale(value: number): AnimatorBuilder {
            this._timeScale = value;


            return this;
        }

        /**
         * Adds layer.
         *
         * @param name Name.
         * @param blender Blender.
         * @param weight Weight.
         * 
         * @return Builder.
         */
        public addLayer(name: string, blender: IAnimationBlender = BuiltinAnimationBlenders.OVERRIDE, weight: number = 1) {
            // TODO Make sure layer name is unique.


            this._layerNames.push(name);
            this._layerBlenders.push(blender);
            this._layerCrossfadeWeighters.push(BuiltinCrossfadeWeighters.LINEAR);
            this._layerWeights.push(weight);


            return this;
        }

        /**
         * Builds [[Animator]].
         * 
         * @return Animator on success; 'null' otherwise.
         */
        public build(): Animator {
            // TODO Validate state.


            // Create layers.
            let layers = new Map<string, AnimationLayer>();


            for (let l = 0; l < this._layerNames.length; ++l) {
                let layer = new AnimationLayer();


                layer.blend = this._layerBlenders[l];
                layer.weightCrossfade = this._layerCrossfadeWeighters[l];
                layer.weight = this._layerWeights[l];


                layers.set(this._layerNames[l], layer);
            }


            // Create animator.
            return Animator._create(this._target, this._timeScale, layers);
        }


        /** Target. */
        private _target: LIVE2DCUBISMCORE.Model;

        /** Time scale. */
        private _timeScale: number = 1;

        /** Layer names. */
        private _layerNames: Array<string> = new Array<string>();

        /** Layer blenders. */
        private _layerBlenders: Array<IAnimationBlender> = new Array<IAnimationBlender>();

        /** Layer crossfade weighters. */
        private _layerCrossfadeWeighters: Array<IAnimationCrossfadeWeighter> = new Array<IAnimationCrossfadeWeighter>();

        /** Layer weights. */
        private _layerWeights: Array<number> = new Array<number>();
    }


    /** Cubism physics 2-component vector. */
    export class PhysicsVector2 {
        /**
         * Initializes instance.
         *
         * @param x X component.
         * @param y Y component. 
         */
        public constructor(public x: number, public y: number) {}
    }


    /** Global Cubism physics settings. */
    export class Physics {
        /** Gravity. */
        public static gravity: PhysicsVector2 = new PhysicsVector2(0, -1);

        /** Wind. */
        public static wind: PhysicsVector2 = new PhysicsVector2(0, 0);
    }


    /** Cubism physics rig. */
    export class PhysicsRig {
        /** Simulation time scale. */
        public timeScale: number = 1;


        /** Updates simulation and applies results. */
        public update(deltaTime: number): void {
            // Scale delta time.
            deltaTime *= ((this.timeScale > 0)
                ? this.timeScale
                : 0);
        }


        /**
         * Creates physics rig.
         * 
         * @param physics3Json Physics descriptor.
         * 
         * @return Rig on success; 'null' otherwise.
         */
        public static _fromPhysics3Json(target: LIVE2DCUBISMCORE.Model, timeScale: number, physics3Json: any) {
            let rig = new PhysicsRig(target, timeScale, physics3Json);


            return (rig._isValid)
                ? rig
                : null;
        }


        /** Target model. */
        private _target: LIVE2DCUBISMCORE.Model;

        /** 'true' if instance is valid; 'false' otherwise. */
        private get _isValid(): boolean {
            return this._target != null;
        }


        /**
         * Initializes instance.
         * 
         * @param physics3Json Physics descriptor.
         */
        private constructor(target: LIVE2DCUBISMCORE.Model, timeScale: number, physics3Json: any) {
            // Store arguments.
            this._target = target;
            this.timeScale = timeScale;


            // TODO Deserialize JSON.
        }
    }


    /** Cubism [[PhysicsRig]] builder. */
    export class PhysicsRigBuilder {
        /**
         * Sets target model.
         *
         * @param value Target.
         * 
         * @return Builder.
         */
        public setTarget(value: LIVE2DCUBISMCORE.Model): PhysicsRigBuilder {
            this._target = value;


            return this;
        }

        /**
         * Sets time scale.
         *
         * @param value Time scale.
         * 
         * @return Builder.
         */
        public setTimeScale(value: number): PhysicsRigBuilder {
            this._timeScale = value;


            return this;
        }

        public setPhysics3Json(value: any): PhysicsRigBuilder {
            this._physics3Json = value;


            return this;
        }


        public build(): PhysicsRig {
            // TODO Validate state.


            return PhysicsRig._fromPhysics3Json(this._target, this._timeScale, this._physics3Json);
        }


        private _target: LIVE2DCUBISMCORE.Model;

        private _timeScale: number = 1;

        private _physics3Json: any;
    }
}
