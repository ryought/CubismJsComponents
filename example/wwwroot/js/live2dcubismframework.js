var LIVE2DCUBISMFRAMEWORK;
(function (LIVE2DCUBISMFRAMEWORK) {
    var AnimationPoint = (function () {
        function AnimationPoint(time, value) {
            this.time = time;
            this.value = value;
        }
        return AnimationPoint;
    }());
    LIVE2DCUBISMFRAMEWORK.AnimationPoint = AnimationPoint;
    var BuiltinAnimationSegmentEvaluators = (function () {
        function BuiltinAnimationSegmentEvaluators() {
        }
        BuiltinAnimationSegmentEvaluators.lerp = function (a, b, t) {
            return new AnimationPoint((a.time + ((b.time - a.time) * t)), (a.value + ((b.value - a.value) * t)));
        };
        BuiltinAnimationSegmentEvaluators.LINEAR = function (points, offset, time) {
            var p0 = points[offset + 0];
            var p1 = points[offset + 1];
            var t = (time - p0.time) / (p1.time - p0.time);
            return (p0.value + ((p1.value - p0.value) * t));
        };
        BuiltinAnimationSegmentEvaluators.BEZIER = function (points, offset, time) {
            var t = (time - points[offset + 0].time) / (points[offset + 3].time - points[offset].time);
            var p01 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 0], points[offset + 1], t);
            var p12 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 1], points[offset + 2], t);
            var p23 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 2], points[offset + 3], t);
            var p012 = BuiltinAnimationSegmentEvaluators.lerp(p01, p12, t);
            var p123 = BuiltinAnimationSegmentEvaluators.lerp(p12, p23, t);
            return BuiltinAnimationSegmentEvaluators.lerp(p012, p123, t).value;
        };
        BuiltinAnimationSegmentEvaluators.STEPPED = function (points, offset, time) {
            return points[offset + 0].value;
        };
        BuiltinAnimationSegmentEvaluators.INVERSE_STEPPED = function (points, offset, time) {
            return points[offset + 1].value;
        };
        return BuiltinAnimationSegmentEvaluators;
    }());
    LIVE2DCUBISMFRAMEWORK.BuiltinAnimationSegmentEvaluators = BuiltinAnimationSegmentEvaluators;
    var AnimationSegment = (function () {
        function AnimationSegment(offset, evaluate) {
            this.offset = offset;
            this.evaluate = evaluate;
        }
        return AnimationSegment;
    }());
    LIVE2DCUBISMFRAMEWORK.AnimationSegment = AnimationSegment;
    var AnimationTrack = (function () {
        function AnimationTrack(targetId, points, segments) {
            this.targetId = targetId;
            this.points = points;
            this.segments = segments;
        }
        AnimationTrack.prototype.evaluate = function (time) {
            var s = 0;
            var lastS = this.segments.length - 1;
            for (; s < lastS; ++s) {
                if (this.points[this.segments[s + 1].offset].time < time) {
                    continue;
                }
                break;
            }
            return this.segments[s].evaluate(this.points, this.segments[s].offset, time);
        };
        return AnimationTrack;
    }());
    LIVE2DCUBISMFRAMEWORK.AnimationTrack = AnimationTrack;
    var Animation = (function () {
        function Animation(model3Json) {
            var _this = this;
            this.modelTracks = new Array();
            this.parameterTracks = new Array();
            this.partOpacityTracks = new Array();
            this.duration = model3Json['Meta']['Duration'];
            this.fps = model3Json['Meta']['Fps'];
            this.loop = model3Json['Meta']['Loop'];
            model3Json['Curves'].forEach(function (c) {
                var s = c['Segments'];
                var points = new Array();
                var segments = new Array();
                points.push(new AnimationPoint(s[0], s[1]));
                for (var t = 2; t < s.length; t += 3) {
                    var offset = points.length - 1;
                    var evaluate = BuiltinAnimationSegmentEvaluators.LINEAR;
                    var type = s[t];
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
                    }
                    points.push(new AnimationPoint(s[t + 1], s[t + 2]));
                    segments.push(new AnimationSegment(offset, evaluate));
                }
                var track = new AnimationTrack(c['Id'], points, segments);
                if (c['Target'] == 'Model') {
                    _this.modelTracks.push(track);
                }
                else if (c['Target'] == 'Parameter') {
                    _this.parameterTracks.push(track);
                }
                else if (c['Target'] == 'PartOpacity') {
                    _this.partOpacityTracks.push(track);
                }
                else {
                }
            });
        }
        Animation.fromMotion3Json = function (model3Json) {
            if (model3Json == null) {
                return null;
            }
            var animation = new Animation(model3Json);
            return (animation.isValid)
                ? animation
                : null;
        };
        Animation.prototype.evaluate = function (time, weight, blend, target) {
            if (weight <= 0.01) {
                return;
            }
            if (this.loop) {
                while (time > this.duration) {
                    time -= this.duration;
                }
            }
            this.parameterTracks.forEach(function (t) {
                var p = target.parameters.ids.indexOf(t.targetId);
                if (p >= 0) {
                    var sample = t.evaluate(time);
                    target.parameters.values[p] = blend(target.parameters.values[p], sample, weight);
                }
            });
            this.partOpacityTracks.forEach(function (t) {
                var p = target.parts.ids.indexOf(t.targetId);
                if (p >= 0) {
                    var sample = t.evaluate(time);
                    target.parts.opacities[p] = blend(target.parts.opacities[p], sample, weight);
                }
            });
        };
        Object.defineProperty(Animation.prototype, "isValid", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        return Animation;
    }());
    LIVE2DCUBISMFRAMEWORK.Animation = Animation;
    var BuiltinCrossfadeWeighters = (function () {
        function BuiltinCrossfadeWeighters() {
        }
        BuiltinCrossfadeWeighters.LINEAR = function (time, duration) {
            return (time / duration);
        };
        return BuiltinCrossfadeWeighters;
    }());
    LIVE2DCUBISMFRAMEWORK.BuiltinCrossfadeWeighters = BuiltinCrossfadeWeighters;
    var AnimationState = (function () {
        function AnimationState() {
        }
        return AnimationState;
    }());
    LIVE2DCUBISMFRAMEWORK.AnimationState = AnimationState;
    var BuiltinAnimationBlenders = (function () {
        function BuiltinAnimationBlenders() {
        }
        BuiltinAnimationBlenders.OVERRIDE = function (source, destination, weight) {
            return (destination * weight);
        };
        BuiltinAnimationBlenders.ADD = function (source, destination, weight) {
            return (source + (destination * weight));
        };
        BuiltinAnimationBlenders.MULTIPLY = function (source, destination, weight) {
            return (source * (1 + ((destination - 1) * weight)));
        };
        return BuiltinAnimationBlenders;
    }());
    LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders = BuiltinAnimationBlenders;
    var AnimationLayer = (function () {
        function AnimationLayer() {
            this.weight = 1;
        }
        Object.defineProperty(AnimationLayer.prototype, "currentAnimation", {
            get: function () {
                return this._animation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationLayer.prototype, "currentTime", {
            get: function () {
                return this._time;
            },
            set: function (value) {
                this._time = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationLayer.prototype, "isPlaying", {
            get: function () {
                return this._play;
            },
            enumerable: true,
            configurable: true
        });
        AnimationLayer.prototype.play = function (animation, fadeDuration) {
            if (fadeDuration === void 0) { fadeDuration = 0; }
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
        };
        AnimationLayer.prototype.pause = function () {
            this._play = false;
        };
        AnimationLayer.prototype.resume = function () {
            this._play = true;
        };
        AnimationLayer.prototype.stop = function () {
            this._play = false;
            this.currentTime = 0;
        };
        AnimationLayer.prototype._update = function (deltaTime) {
            if (!this._play) {
                return;
            }
            this._time += deltaTime;
            this._goalTime += deltaTime;
            this._fadeTime += deltaTime;
        };
        AnimationLayer.prototype._evaluate = function (target) {
            if (this._animation == null) {
                return;
            }
            var weight = (this.weight < 1)
                ? this.weight
                : 1;
            var animationWeight = (this._goalAnimation != null)
                ? (weight * this.weightCrossfade(this._fadeTime, this._fadeDuration))
                : weight;
            this._animation.evaluate(this._time, animationWeight, this.blend, target);
            if (this._goalAnimation != null) {
                animationWeight = 1 - (weight * this.weightCrossfade(this._fadeTime, this._fadeDuration));
                this._goalAnimation.evaluate(this._goalTime, animationWeight, this.blend, target);
                if (this._fadeTime > this._fadeDuration) {
                    this._animation = this._goalAnimation;
                    this._time = this._goalTime;
                    this._goalAnimation = null;
                }
            }
        };
        return AnimationLayer;
    }());
    LIVE2DCUBISMFRAMEWORK.AnimationLayer = AnimationLayer;
    var Animator = (function () {
        function Animator(target, timeScale, layers) {
            this._target = target;
            this.timeScale = timeScale;
            this._layers = layers;
        }
        Object.defineProperty(Animator.prototype, "target", {
            get: function () {
                return this._target;
            },
            enumerable: true,
            configurable: true
        });
        Animator.prototype.getLayer = function (name) {
            return this._layers.has(name)
                ? this._layers.get(name)
                : null;
        };
        Animator.prototype.update = function (deltaTime) {
            var _this = this;
            deltaTime *= ((this.timeScale > 0)
                ? this.timeScale
                : 0);
            this._layers.forEach(function (l) {
                l._update(deltaTime);
                l._evaluate(_this._target);
            });
        };
        Animator._create = function (target, timeScale, layers) {
            var animator = new Animator(target, timeScale, layers);
            return animator.isValid
                ? animator
                : null;
        };
        Object.defineProperty(Animator.prototype, "isValid", {
            get: function () {
                return this._target != null;
            },
            enumerable: true,
            configurable: true
        });
        return Animator;
    }());
    LIVE2DCUBISMFRAMEWORK.Animator = Animator;
    var AnimatorBuilder = (function () {
        function AnimatorBuilder() {
            this._timeScale = 1;
            this._layerNames = new Array();
            this._layerBlenders = new Array();
            this._layerCrossfadeWeighters = new Array();
            this._layerWeights = new Array();
        }
        AnimatorBuilder.prototype.setTarget = function (value) {
            this._target = value;
            return this;
        };
        AnimatorBuilder.prototype.setTimeScale = function (value) {
            this._timeScale = value;
            return this;
        };
        AnimatorBuilder.prototype.addLayer = function (name, blender, weight) {
            if (blender === void 0) { blender = BuiltinAnimationBlenders.OVERRIDE; }
            if (weight === void 0) { weight = 1; }
            this._layerNames.push(name);
            this._layerBlenders.push(blender);
            this._layerCrossfadeWeighters.push(BuiltinCrossfadeWeighters.LINEAR);
            this._layerWeights.push(weight);
            return this;
        };
        AnimatorBuilder.prototype.build = function () {
            var layers = new Map();
            for (var l = 0; l < this._layerNames.length; ++l) {
                var layer = new AnimationLayer();
                layer.blend = this._layerBlenders[l];
                layer.weightCrossfade = this._layerCrossfadeWeighters[l];
                layer.weight = this._layerWeights[l];
                layers.set(this._layerNames[l], layer);
            }
            return Animator._create(this._target, this._timeScale, layers);
        };
        return AnimatorBuilder;
    }());
    LIVE2DCUBISMFRAMEWORK.AnimatorBuilder = AnimatorBuilder;
    var PhysicsVector2 = (function () {
        function PhysicsVector2(x, y) {
            this.x = x;
            this.y = y;
        }
        return PhysicsVector2;
    }());
    LIVE2DCUBISMFRAMEWORK.PhysicsVector2 = PhysicsVector2;
    var Physics = (function () {
        function Physics() {
        }
        Physics.gravity = new PhysicsVector2(0, -1);
        Physics.wind = new PhysicsVector2(0, 0);
        return Physics;
    }());
    LIVE2DCUBISMFRAMEWORK.Physics = Physics;
    var PhysicsRig = (function () {
        function PhysicsRig(target, timeScale, physics3Json) {
            this.timeScale = 1;
            this._target = target;
            this.timeScale = timeScale;
        }
        PhysicsRig.prototype.update = function (deltaTime) {
            deltaTime *= ((this.timeScale > 0)
                ? this.timeScale
                : 0);
        };
        PhysicsRig._fromPhysics3Json = function (target, timeScale, physics3Json) {
            var rig = new PhysicsRig(target, timeScale, physics3Json);
            return (rig._isValid)
                ? rig
                : null;
        };
        Object.defineProperty(PhysicsRig.prototype, "_isValid", {
            get: function () {
                return this._target != null;
            },
            enumerable: true,
            configurable: true
        });
        return PhysicsRig;
    }());
    LIVE2DCUBISMFRAMEWORK.PhysicsRig = PhysicsRig;
    var PhysicsRigBuilder = (function () {
        function PhysicsRigBuilder() {
            this._timeScale = 1;
        }
        PhysicsRigBuilder.prototype.setTarget = function (value) {
            this._target = value;
            return this;
        };
        PhysicsRigBuilder.prototype.setTimeScale = function (value) {
            this._timeScale = value;
            return this;
        };
        PhysicsRigBuilder.prototype.setPhysics3Json = function (value) {
            this._physics3Json = value;
            return this;
        };
        PhysicsRigBuilder.prototype.build = function () {
            return PhysicsRig._fromPhysics3Json(this._target, this._timeScale, this._physics3Json);
        };
        return PhysicsRigBuilder;
    }());
    LIVE2DCUBISMFRAMEWORK.PhysicsRigBuilder = PhysicsRigBuilder;
})(LIVE2DCUBISMFRAMEWORK || (LIVE2DCUBISMFRAMEWORK = {}));
