// Global imports -
import * as THREE from 'three'
import { TweenMax, Power2 } from 'gsap/TweenMax'
import * as YUKA from '../lib/yuka'

// Local imports -
// Components
import Renderer from './components/renderer'
import Camera from './components/camera'
import Light from './components/light'
import Controls from './components/controls'

// Helpers
import Geometry from './helpers/geometry'
import Stats from './helpers/stats'

// Model
import Texture from './model/texture'
import Model from './model/model'

// Managers
import Interaction from './managers/interaction'
import DatGUI from './managers/datGUI'

// data
import Config from './../data/config'

import { createConvexRegionHelper } from './helpers/navmeshHelper'
import { Enemy } from './components/Enemy'
// -- End of imports

// This class instantiates and ties all of the components together, starts the loading process and renders the main loop
export default class Main {
  constructor(container) {
    // Set container property to container element
    this.container = container

    const loadingManager = new THREE.LoadingManager( () => {

      // 3D assets are loaded, now load nav mesh
      console.log('test loading manager')
    } );

    // Start Three clock
    this.clock = new THREE.Clock()

    // Main scene creation
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near)

    // const boxGeometry = new THREE.BoxBufferGeometry( 10, 10, 10 );
		// const boxMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    // const cube = new THREE.Mesh( boxGeometry, boxMaterial );
		// cube.matrixAutoUpdate = false;
		// this.scene.add(cube);

    // this.enemy = new Enemy();
    // this.enemy.boundingRadius = 0.25;
    // this.enemy.setRenderComponent(cube, this.syncEnemy);
    // this.enemy.position.set( 0, 0, 0);

    const loader = new YUKA.NavMeshLoader();
			loader.load( './assets/models/navmesh3.glb', { epsilonCoplanarTest: 0.25 } ).then( ( navMesh ) => {

				// visualize convex regions

        const navMeshGroup = createConvexRegionHelper( navMesh );
        navMeshGroup.scale.multiplyScalar(10)
        this.scene.add( navMeshGroup );
        
				// player.navMesh = navMesh;
        enemy.navMesh = navMesh;
        
        console.log('loaded navmesh')
			} );

    // Get Device Pixel Ratio first for retina
    if (window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio
    }

    // Main renderer constructor
    this.renderer = new Renderer(this.scene, container)

    // Components instantiations
    this.camera = new Camera(this.renderer.threeRenderer)
    this.controls = new Controls(this.camera.threeCamera, container)
    this.light = new Light(this.scene)

    // Create and place lights in scene
    const lights = ['ambient', 'directional', 'point', 'hemi']
    lights.forEach(light => this.light.place(light))

    // Create and place geo in scene
    // this.geometry = new Geometry(this.scene)
    // this.geometry.make('plane')(150, 150, 10, 10)
    // this.geometry.place([0, 1, 0], [Math.PI / 2, 0, 0])

    // this.box = new Geometry(this.scene)
    // this.box.make('box')(10, 10, 10, 8, 8, 8)
    // this.box.place([0, 10, 20], [0, 0, 0])

    // Set up rStats if dev environment
    if (Config.isDev && Config.isShowingStats) {
      this.stats = new Stats(this.renderer)
      this.stats.setUp()
    }

    // Instantiate texture class
    this.texture = new Texture()

    // Start loading the textures and then go on to load the model after the texture Promises have resolved
    this.texture.load().then(() => {
      this.manager = new THREE.LoadingManager()

      // Textures loaded, load model
      this.model = new Model(this.scene, this.manager, this.texture.textures)
      this.model.load()

      // onProgress callback
      this.manager.onProgress = (item, loaded, total) => {
        console.log(`${item}: ${loaded} ${total}`)
      }

      // All loaders done now
      this.manager.onLoad = () => {
        // Set up interaction manager with the app now that the model is finished loading
        new Interaction(
          this.renderer.threeRenderer,
          this.scene,
          this.camera.threeCamera,
          this.controls.threeControls
        )

        // Add dat.GUI controls if dev
        if (Config.isDev) {
          new DatGUI(this, this.model.obj)
        }

        // Everything is now fully loaded
        Config.isLoaded = true
        this.container.querySelector('#loading').style.display = 'none'

        // TweenMax.to(this.lift.position, 2, {
        //   y: 4,
        //   repeat: -1,
        //   yoyo: true,
        //   ease: Power2.easeInOut
        // })
      }
    })

    // Start render which does not wait for model fully loaded
    this.render()
  }

  syncEnemy( entity, renderComponent ) {
    renderComponent.matrix.copy( entity.worldMatrix )
  }

  render() {
    // Render rStats if Dev
    if (Config.isDev && Config.isShowingStats) {
      Stats.start()
    }

    // Call render function and pass in created scene and camera
    this.renderer.render(this.scene, this.camera.threeCamera)

    // rStats has finished determining render call now
    if (Config.isDev && Config.isShowingStats) {
      Stats.end()
    }

    // Delta time is sometimes needed for certain updates
    //const delta = this.clock.getDelta();

    // Call any vendor or module frame updates here
    this.controls.threeControls.update()

    // RAF
    requestAnimationFrame(this.render.bind(this)) // Bind the main class instead of window object
  }
  
}
