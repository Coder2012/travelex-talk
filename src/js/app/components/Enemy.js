import * as THREE from 'three'
import * as YUKA from '../../lib/yuka'

const startPosition = new THREE.Vector3();
const endPosition = new THREE.Vector3();

class Enemy extends YUKA.Vehicle {

	constructor() {

		super();

		this.maxSpeed = 4;

		this.updateOrientation = false;
		this.navMesh = null;
		this.currentRegion = null;

	}

	update( delta ) {

		startPosition.copy( this.position );

		super.update( delta );

		endPosition.copy( this.position );

		// ensure the entity stays inside its navmesh

		this.currentRegion = this.navMesh.clampMovement(
			this.currentRegion,
			startPosition,
			endPosition,
			this.position
		);

		// adjust height of player according to the ground

		const distance = this.currentRegion.distanceToPoint( this.position );

		this.position.y -= distance * 0.2; // smooth transition

	}

}


export { Enemy };
