var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LIVE2DCUBISMPIXI;
(function (LIVE2DCUBISMPIXI) {
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(ccoreModel, textures, animator, autoDestroyTextures) {
            var _this = _super.call(this) || this;
            _this._coreModel = ccoreModel;
            _this._textures = textures;
            _this._animator = animator;
            _this._autoDestroyTextures = autoDestroyTextures;
            if (_this._coreModel == null) {
                return _this;
            }
            _this._meshes = new Array(_this._coreModel.drawables.ids.length);
            for (var m = 0; m < _this._meshes.length; ++m) {
                var uvs = _this._coreModel.drawables.vertexUvs[m].slice(0, _this._coreModel.drawables.vertexUvs[m].length);
                for (var v = 1; v < uvs.length; v += 2) {
                    uvs[v] = 1 - uvs[v];
                }
                _this._meshes[m] = new PIXI.mesh.Mesh(textures[_this._coreModel.drawables.textureIndices[m]], _this._coreModel.drawables.vertexPositions[m], uvs, _this._coreModel.drawables.indices[m], PIXI.DRAW_MODES.TRIANGLES);
                _this._meshes[m].scale.y *= -1;
                if (LIVE2DCUBISMCORE.Utils.hasBlendAdditiveBit(_this._coreModel.drawables.constantFlags[m])) {
                    _this._meshes[m].blendMode = PIXI.BLEND_MODES.ADD;
                }
                else if (LIVE2DCUBISMCORE.Utils.hasBlendMultiplicativeBit(_this._coreModel.drawables.constantFlags[m])) {
                    _this._meshes[m].blendMode = PIXI.BLEND_MODES.MULTIPLY;
                }
                _this.addChild(_this._meshes[m]);
            }
            ;
            return _this;
        }
        Object.defineProperty(Model.prototype, "parameters", {
            get: function () {
                return this._coreModel.parameters;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "parts", {
            get: function () {
                return this._coreModel.parts;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "drawables", {
            get: function () {
                return this._coreModel.drawables;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "textures", {
            get: function () {
                return this._textures;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "animator", {
            get: function () {
                return this._animator;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "meshes", {
            get: function () {
                return this._meshes;
            },
            enumerable: true,
            configurable: true
        });
        Model.prototype.update = function (delta) {
            var _this = this;
            var deltaTime = 0.016 * delta;
            this._animator.update(deltaTime);
            this._coreModel.update();
            var sort = false;
            for (var m = 0; m < this._meshes.length; ++m) {
                this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
                this._meshes[m].visible = LIVE2DCUBISMCORE.Utils.hasIsVisibleBit(this._coreModel.drawables.dynamicFlags[m]);
                if (LIVE2DCUBISMCORE.Utils.hasVertexPositionsDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                    this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[m];
                    this._meshes[m].dirtyVertex = true;
                }
                if (LIVE2DCUBISMCORE.Utils.hasRenderOrderDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                    sort = true;
                }
            }
            if (sort) {
                this.children.sort(function (a, b) {
                    var aIndex = _this._meshes.indexOf(a);
                    var bIndex = _this._meshes.indexOf(b);
                    var aRenderOrder = _this._coreModel.drawables.renderOrders[aIndex];
                    var bRenderOrder = _this._coreModel.drawables.renderOrders[bIndex];
                    return aRenderOrder - bRenderOrder;
                });
            }
            this._coreModel.drawables.resetDynamicFlags();
        };
        Model.prototype.destroy = function () {
            if (this._coreModel != null) {
                this._coreModel.release();
            }
            _super.prototype.destroy.call(this);
            this._meshes.forEach(function (m) {
                m.destroy();
            });
            if (this._autoDestroyTextures) {
                this._textures.forEach(function (t) {
                    t.destroy();
                });
            }
        };
        Model._create = function (coreModel, textures, animator, autoDestroyTextures) {
            var model = new Model(coreModel, textures, animator, autoDestroyTextures);
            if (!model.isValid) {
                model.destroy();
                return null;
            }
            return model;
        };
        Object.defineProperty(Model.prototype, "isValid", {
            get: function () {
                return this._coreModel != null;
            },
            enumerable: true,
            configurable: true
        });
        return Model;
    }(PIXI.Container));
    LIVE2DCUBISMPIXI.Model = Model;
    var ModelBuilder = (function () {
        function ModelBuilder() {
            this._textures = new Array();
            this._autoDestroyTextures = false;
            this._animatorBuilder = new LIVE2DCUBISMFRAMEWORK.AnimatorBuilder();
        }
        ModelBuilder.prototype.setMoc = function (value) {
            this._moc = value;
            return this;
        };
        ModelBuilder.prototype.setAnimatorTimeScale = function (value) {
            this._animatorBuilder.setTimeScale(value);
            return this;
        };
        ModelBuilder.prototype.addTexture = function (index, texture) {
            this._textures.splice(index, 0, texture);
            return this;
        };
        ModelBuilder.prototype.addAnimatorLayer = function (name, blender, weight) {
            if (blender === void 0) { blender = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE; }
            if (weight === void 0) { weight = 1; }
            this._animatorBuilder.addLayer(name, blender, weight);
            return this;
        };
        ModelBuilder.prototype.autoDestroyTextures = function () {
            this._autoDestroyTextures = true;
            return this;
        };
        ModelBuilder.prototype.build = function () {
            var coreModel = LIVE2DCUBISMCORE.Model.fromMoc(this._moc);
            if (coreModel == null) {
                return null;
            }
            this._animatorBuilder.setTarget(coreModel);
            var animator = this._animatorBuilder.build();
            return Model._create(coreModel, this._textures, animator, this._autoDestroyTextures);
        };
        return ModelBuilder;
    }());
    LIVE2DCUBISMPIXI.ModelBuilder = ModelBuilder;
})(LIVE2DCUBISMPIXI || (LIVE2DCUBISMPIXI = {}));
