THREE.VirtualBoyShader = {

    uniforms: {

        "tDiffuse": {type: "t", value: null},
        "rPower": {type: "f", value: 0.2126},
        "gPower": {type: "f", value: 0.7152},
        "bPower": {type: "f", value: 0.0722},
        "bitSize": {type: "i", value: 2}

    },

    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"

    ].join("\n"),

    fragmentShader: [
        "uniform float rPower;",
        "uniform float gPower;",
        "uniform float bPower;",
        "uniform int bitSize;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 texel = texture2D( tDiffuse, vUv );",
            "float gray = texel.r*rPower + texel.g*gPower + texel.b*bPower;",
            "float n = pow(float(bitSize),2.0);",
            "float newR = floor(gray*n)/n;",
            "gl_FragColor = vec4( newR, 0, 0, texel.w );",
        "}"
    ].join("\n")
};

// based on THREE.CardboardEffect
THREE.VirtualBoyEffect = function ( renderer ) {

	var _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	var _scene = new THREE.Scene();

    var clock = new THREE.Clock();
    var renderPass = new THREE.RenderPass(_scene, _camera);
    var virtualBoyPass = new THREE.ShaderPass(THREE.VirtualBoyShader);
    THREE.VignetteShader.uniforms.offset.value = 1.5;
    THREE.VignetteShader.uniforms.darkness.value = 1.2;
    var vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
    var effectFilm = new THREE.FilmPass(0.8, 0.325, 256, false);
    effectFilm.renderToScreen = true;

	var _stereo = new THREE.StereoCamera();
	_stereo.aspect = 0.5;

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	var _renderTarget = new THREE.WebGLRenderTarget( 512, 512, _params );
	_renderTarget.scissorTest = true;

	// Distortion Mesh ported from:
	// https://github.com/borismus/webvr-boilerplate/blob/master/src/distortion/barrel-distortion-fragment.js

	var distortion = new THREE.Vector2( 0.441, 0.156 );

	var geometry = new THREE.PlaneBufferGeometry( 1, 1, 10, 20 ).removeAttribute( 'normal' ).toNonIndexed();

	var positions = geometry.attributes.position.array;
	var uvs = geometry.attributes.uv.array;

	// duplicate

	var positions2 = new Float32Array( positions.length * 2 );
	positions2.set( positions );
	positions2.set( positions, positions.length );

	var uvs2 = new Float32Array( uvs.length * 2 );
	uvs2.set( uvs );
	uvs2.set( uvs, uvs.length );

	var vector = new THREE.Vector2();
	var length = positions.length / 3;

	for ( var i = 0, l = positions2.length / 3; i < l; i ++ ) {

		vector.x = positions2[ i * 3 + 0 ];
		vector.y = positions2[ i * 3 + 1 ];

		var dot = vector.dot( vector );
		var scalar = 1.5 + ( distortion.x + distortion.y * dot ) * dot;

		var offset = i < length ? 0 : 1;

		positions2[ i * 3 + 0 ] = ( vector.x / scalar ) * 1.5 - 0.5 + offset;
		positions2[ i * 3 + 1 ] = ( vector.y / scalar ) * 3.0;

		uvs2[ i * 2 ] = ( uvs2[ i * 2 ] + offset ) * 0.5;

	}

	geometry.attributes.position.array = positions2;
	geometry.attributes.uv.array = uvs2;

	//

	// var material = new THREE.MeshBasicMaterial( { wireframe: true } );
	var material = new THREE.MeshBasicMaterial( { map: _renderTarget } );
	var mesh = new THREE.Mesh( geometry, material );
	_scene.add( mesh );

	//

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

		var pixelRatio = renderer.getPixelRatio();

		_renderTarget.setSize( width * pixelRatio, height * pixelRatio );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		_stereo.update( camera );

		var width = _renderTarget.width / 2;
		var height = _renderTarget.height;

		_renderTarget.scissor.set( 0, 0, width, height );
		_renderTarget.viewport.set( 0, 0, width, height );
		renderer.render( scene, _stereo.cameraL, _renderTarget );

		_renderTarget.scissor.set( width, 0, width, height );
		_renderTarget.viewport.set( width, 0, width, height );
		renderer.render( scene, _stereo.cameraR, _renderTarget );

		//renderer.render( _scene, _camera );

		_renderTarget.scissor.set( 0, 0, width*2, height );
		_renderTarget.viewport.set( 0, 0, width*2, height );
        var composer = new THREE.EffectComposer(renderer, _renderTarget);
        composer.addPass(renderPass);
        composer.addPass(virtualBoyPass);
        composer.addPass(vignettePass);
        composer.addPass(effectFilm);
        composer.render(clock.getDelta());
	};

};
