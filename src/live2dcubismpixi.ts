/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */


namespace LIVE2DCUBISMPIXI {
    /** PIXI Cubism model wrapper. */
    export class Model extends PIXI.Container {
        /** Parameters. */
        public get parameters(): LIVE2DCUBISMCORE.Parameters {
            return this._coreModel.parameters;
        }
        /** Parts. */
        public get parts(): LIVE2DCUBISMCORE.Parts {
            return this._coreModel.parts;
        }
        /** Drawables. */
        public get drawables(): LIVE2DCUBISMCORE.Drawables {
            return this._coreModel.drawables;
        }
        /** Textures. */
        public get textures():Array<PIXI.Texture> {
            return this._textures;
        }
        /** Animator. */
        public get animator(): LIVE2DCUBISMFRAMEWORK.Animator {
            return this._animator;
        }
        /** Drawable meshes. */
        public get meshes(): Array<PIXI.mesh.Mesh> {
            return this._meshes;
        }


        /** Updates model including graphic resources. */
        public update(delta: number): void {
            // Patch delta time (as Pixi's delta references performance?)
            let deltaTime = 0.016 * delta;


            // Update components.
            this._animator.updateAndEvaluate(deltaTime);
            if (this._physicsRig) {
                this._physicsRig.updateAndEvaluate(deltaTime);
            }

            
            // Update model.
            this._coreModel.update();


            // Sync draw data.
            let sort = false;
            for (let m = 0; m < this._meshes.length; ++m) {
                // Sync opacity and visiblity.
                this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
                this._meshes[m].visible = LIVE2DCUBISMCORE.Utils.hasIsVisibleBit(this._coreModel.drawables.dynamicFlags[m]);
                // Sync vertex positions if necessary.
                if (LIVE2DCUBISMCORE.Utils.hasVertexPositionsDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                    this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[m];
                    this._meshes[m].dirtyVertex = true;
                }
                // Update render order if necessary.
                if (LIVE2DCUBISMCORE.Utils.hasRenderOrderDidChangeBit(this._coreModel.drawables.dynamicFlags[m])) {
                    sort = true;
                }
            }


            // TODO Profile.
            if (sort) {
                this.children.sort((a, b) => {
                    let aIndex = this._meshes.indexOf(a as PIXI.mesh.Mesh);
                    let bIndex = this._meshes.indexOf(b as PIXI.mesh.Mesh);
                    let aRenderOrder = this._coreModel.drawables.renderOrders[aIndex];
                    let bRenderOrder = this._coreModel.drawables.renderOrders[bIndex];


                    return aRenderOrder - bRenderOrder;
                });
            }


            this._coreModel.drawables.resetDynamicFlags();
        }

        /** Destroys model. */
        public destroy(options?: any): void {
            // Release model.
            if (this._coreModel != null) {
                this._coreModel.release();
            }


            // Release base.
            super.destroy(options);


            // Explicitly release meshes.
            this._meshes.forEach((m) => {
                m.destroy();
            });


            // Optionally destroy textures.
            if (options == true || options.texture) {
                this._textures.forEach((t) => {
                    t.destroy();
                });
            }
        }


        /**
         * Creates model.
         * 
         * @param moc Moc.
         * @param textures Textures.
         * @param animator Animator.
         * @param physicsRig [Optional] Physics rig.
         * 
         * @return Model on success; 'null' otherwise.
         */
        public static _create(coreModel: LIVE2DCUBISMCORE.Model, textures: Array<PIXI.Texture>, animator: LIVE2DCUBISMFRAMEWORK.Animator, physicsRig: LIVE2DCUBISMFRAMEWORK.PhysicsRig = null): Model {
            let model = new Model(coreModel, textures, animator, physicsRig);


            if (!model.isValid) {
                model.destroy();


                return null;
            }


            return model;
        }


        /** Cubism model. */
        private _coreModel: LIVE2DCUBISMCORE.Model;
        /** Drawable textures. */
        private _textures: Array<PIXI.Texture>;
        /** Animator. */
        private _animator: LIVE2DCUBISMFRAMEWORK.Animator;
        /** Physics rig. */
        private _physicsRig: LIVE2DCUBISMFRAMEWORK.PhysicsRig;
        /** Drawable meshes. */
        private _meshes: Array<PIXI.mesh.Mesh>;


        /**
         * Creates instance.
         * 
         * @param moc Moc.
         * @param textures Textures. 
         */
        private constructor(coreModel: LIVE2DCUBISMCORE.Model, textures: Array<PIXI.Texture>, animator: LIVE2DCUBISMFRAMEWORK.Animator, physicsRig: LIVE2DCUBISMFRAMEWORK.PhysicsRig)
        {
            // Initialize base class.
            super();


            // Store arguments.
            this._coreModel = coreModel;
            this._textures = textures;
            this._animator = animator;
            this._physicsRig = physicsRig;


            // Return early if model instance creation failed.
            if (this._coreModel == null) {
                return;
            }


            // Create meshes.
            this._meshes = new Array<PIXI.mesh.Mesh>(this._coreModel.drawables.ids.length);


            for (let m = 0; m < this._meshes.length; ++m) {
                // Patch uvs.
                let uvs = this._coreModel.drawables.vertexUvs[m].slice(0, this._coreModel.drawables.vertexUvs[m].length);


                for (var v = 1; v < uvs.length; v += 2) {
                    uvs[v] = 1 - uvs[v];
                }

                
                // Create mesh.
                this._meshes[m] = new PIXI.mesh.Mesh(
                    textures[this._coreModel.drawables.textureIndices[m]],
                    this._coreModel.drawables.vertexPositions[m],
                    uvs,
                    this._coreModel.drawables.indices[m],
                    PIXI.DRAW_MODES.TRIANGLES);


                // HACK Flip mesh...
                this._meshes[m].scale.y *= -1; 


                // TODO Implement culling.
                

                if (LIVE2DCUBISMCORE.Utils.hasBlendAdditiveBit(this._coreModel.drawables.constantFlags[m])) {
                    this._meshes[m].blendMode = PIXI.BLEND_MODES.ADD;
                }
                else if (LIVE2DCUBISMCORE.Utils.hasBlendMultiplicativeBit(this._coreModel.drawables.constantFlags[m])) {
                    this._meshes[m].blendMode = PIXI.BLEND_MODES.MULTIPLY;
                }


                // Attach mesh to self.
                this.addChild(this._meshes[m]);
            };


            // TODO Implement masking.
        }


        /** [[true]] if instance is valid; [[false]] otherwise. */
        private get isValid(): boolean {
            return this._coreModel != null;
        }
    }


    /** PIXI Cubism [[Model]] builder. */
    export class ModelBuilder {
        /**
         * Sets moc.
         * 
         * @param value Moc.
         * 
         * @return Builder.
         */
        public setMoc(value: LIVE2DCUBISMCORE.Moc): ModelBuilder {
            this._moc = value;


            return this;
        }

        /**
         * Sets animator time scale.
         *
         * @param value Time scale.
         * 
         * @return Builder.
         */
        public setTimeScale(value: number): ModelBuilder {
            this._timeScale = value;


            return this;
        }

        /**
         * Sets physics JSON file.
         * 
         * @param value Physics JSON file.
         * 
         * @return Builder.
         */
        public setPhysics3Json(value: any): ModelBuilder {
            if (!this._physicsRigBuilder) {
                this._physicsRigBuilder = new LIVE2DCUBISMFRAMEWORK.PhysicsRigBuilder();
            }
            this._physicsRigBuilder.setPhysics3Json(value);


            return this;
        }

        /**
         * Adds texture.
         * 
         * @param index Texture index.
         * @param texture Texture.
         * 
         * @return Builder.
         */
        public addTexture(index: number, texture: PIXI.Texture): ModelBuilder {
            this._textures.splice(index, 0, texture);


            return this;
        }

        /**
         * Adds animator layer.
         *
         * @param name Name.
         * @param blender Blender.
         * @param weight Weight.
         * 
         * @return Builder.
         */
        public addAnimatorLayer(name: string, blender: LIVE2DCUBISMFRAMEWORK.IAnimationBlender = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, weight: number = 1) {
            this._animatorBuilder.addLayer(name, blender, weight);


            return this;
        }


        /**
         * Executes build.
         *
         * @return Model.
         */
        public build(): Model {
            // TODO Validate state.


            // Create core.
            let coreModel = LIVE2DCUBISMCORE.Model.fromMoc(this._moc);


            if (coreModel == null) {
                return null;
            }


            // Create animator.
            let animator = this._animatorBuilder
                .setTarget(coreModel)
                .setTimeScale(this._timeScale)
                .build();


            // Create physics rig if JSON available.
            let physicsRig: LIVE2DCUBISMFRAMEWORK.PhysicsRig = null;


            if (this._physicsRigBuilder) {
                physicsRig = this._physicsRigBuilder
                    .setTarget(coreModel)
                    .setTimeScale(this._timeScale)
                    .build();
            }


            // Create model.
            return Model._create(coreModel, this._textures, animator, physicsRig);
        }


        /** Moc. */
        private _moc: LIVE2DCUBISMCORE.Moc;
        /** Textures. */
        private _textures: Array<PIXI.Texture> = new Array<PIXI.Texture>();
        /** Time scale. */
        private _timeScale: number = 1;
        /** Animator builder. */
        private _animatorBuilder: LIVE2DCUBISMFRAMEWORK.AnimatorBuilder = new LIVE2DCUBISMFRAMEWORK.AnimatorBuilder();
        /** Physics rig builder. */
        private _physicsRigBuilder: LIVE2DCUBISMFRAMEWORK.PhysicsRigBuilder;
    }
}
