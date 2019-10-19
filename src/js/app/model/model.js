import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

import Material from '../helpers/material';
import MeshHelper from '../helpers/meshHelper';
import Helpers from '../../utils/helpers';
import Config from '../../data/config';

// Loads in a single object from the config file
export default class Model {
  constructor(scene, manager, textures) {
    this.scene = scene;
    this.textures = textures;

    // Manager is passed in to loader to determine when loading done in main
    this.loader = new GLTFLoader(manager);
    this.obj = null;
  }

  load() {
    // Load model with ObjectLoader
    this.loader.load(
      Config.model.path,
      gltf => {
        

        // Add mesh helper if Dev
        // if(Config.isDev && Config.mesh.enableHelper) {
        //   new MeshHelper(this.scene, obj);
        // }

        // Set prop to obj so it can be accessed from outside the class
        this.obj = gltf.scene;

        this.obj.scale.multiplyScalar(Config.model.scale);
        this.scene.add(this.obj);
      },
      Helpers.logProgress(),
      Helpers.logError()
    );
  }
}
