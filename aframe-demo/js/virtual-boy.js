AFRAME.registerComponent('virtual-boy', {
  init: function () {
    this.createEnterVBButton();

    if (this.el.camera) {
      this.becomeVB();
    }
    else {
      this.el.addEventListener('camera-set-active', function () { 
        this.becomeVB();
      }.bind(this));
    }
  },

  remove: function() {
    this.el.renderer.render = this.originalRender;
  },

  becomeVB: function() {
    this.el.renderer.render = this.getVBRender();
  },

  getVBRender: function() {
    if (!this.vbRender) this.createVBRender();
    return this.vbRender;
  },

  createVBRender: function() {
    this.originalRender = this.el.renderer.render.bind(this.el.renderer);

    var renderPass = new THREE.RenderPass(this.el.object3D, this.el.camera);
    var virtualBoyPass = new THREE.ShaderPass({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    });
    THREE.VignetteShader.uniforms.offset.value = 1.5;
    THREE.VignetteShader.uniforms.darkness.value = 1.2;
    var vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
    var effectFilm = new THREE.FilmPass(0.8, 0.325, 256, false);
    effectFilm.renderToScreen = true;
    var composer = new THREE.EffectComposer({
      render: this.originalRender,
      getSize: this.el.renderer.getSize.bind(this.el.renderer)
    });
    composer.addPass(renderPass);
    composer.addPass(virtualBoyPass);
    composer.addPass(vignettePass);
    composer.addPass(effectFilm);

    var clock = new THREE.Clock();
    this.vbRender = function() {
      this.originalRender(this.el.object3D, this.el.camera);
      composer.render(clock.getDelta());
    }.bind(this);
  },

  createEnterVBButton() {
    if (document.getElementsByClassName('enter-virtual-boy-button').length === 0) {
      var wrapper = document.getElementsByClassName('a-enter-vr')[0];
      var vrButton = document.getElementsByClassName('a-enter-vr-button')[0];
      var vbButton = document.createElement('button');
      vbButton.className = 'enter-virtual-boy-button';
      vbButton.style.background = window.getComputedStyle(vrButton)['background'];
      vbButton.style.border = window.getComputedStyle(vrButton)['border'];
      vbButton.style.backgroundColor = window.getComputedStyle(vrButton)['backgroundColor'];
      vbButton.style.filter = 'invert(50%) sepia(100%) hue-rotate(300deg) saturate(100%)';
      wrapper.appendChild(vbButton);
      vbButton.style.minWidth = '50px';
      vbButton.style.minHeight = '30px';
      vbButton.style.position = 'absolute';
      vbButton.style.paddingTop = '4%';
      vbButton.style.paddingLeft = '5%';
      vbButton.style.marginLeft = '3%';
      vbButton.style.bottom = '0';
      vbButton.addEventListener('click', function() {
        if (this.el.hasAttribute('virtual-boy')) {
          this.el.removeAttribute('virtual-boy');
        }
        else {
          this.el.setAttribute('virtual-boy', true);
        }
      }.bind(this));
    }
  },

  originalRender: null,

  vbRender: null,

  vertexShader:
    "varying vec2 vUv;" +
    "void main() {" +
    "  vUv = uv;" +
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);" +
    "}",

  fragmentShader:
    "uniform float rPower;" +
    "uniform float gPower;" +
    "uniform float bPower;" +
    "uniform int bitSize;" +
    "uniform sampler2D tDiffuse;" +
    "varying vec2 vUv;" +
    "void main() {" +
    "  vec4 texel = texture2D(tDiffuse, vUv);" +
    "  float gray = texel.r*rPower + texel.g*gPower + texel.b*bPower;" +
    "  float n = pow(float(bitSize), 2.0);" +
    "  float newR = floor(gray*n)/n;" +
    "  gl_FragColor = vec4(newR, 0, 0, texel.w);" +
    "}",

  uniforms: {
    "tDiffuse": {type: "t", value: null},
    "rPower": {type: "f", value: 0.2126},
    "gPower": {type: "f", value: 0.7152},
    "bPower": {type: "f", value: 0.0722},
    "bitSize": {type: "i", value: 2}
  }
});
