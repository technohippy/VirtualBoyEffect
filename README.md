VirtualBoyEffect for Three.js
=============================

This effect makes your scene into something like a Virtual Boy application.

<img src="https://raw.githubusercontent.com/technohippy/VirtualBoyEffect/master/screenshot.png" width="400">

## Description

[The Virtual Boy](https://en.wikipedia.org/wiki/Virtual_Boy) is a legendary video game console developed by Nintendo.
By using this effect and the Google Cardboard, you can virtualboyize your three.js application.

Note that this effect is built on codes from the deprecated CardboardEffect so there may be same issues as the effect.

## Demo

https://technohippy.github.io/VirtualBoyEffect

## Usage

Include required libs:

```html
<script src="js/three.js"></script>
<script src="js/EffectComposer.js"></script>
<script src="js/FilmShader.js"></script>
<script src="js/FilmPass.js"></script>
<script src="js/RenderPass.js"></script>
<script src="js/CopyShader.js"></script>
<script src="js/ShaderPass.js"></script>
<script src="js/VignetteShader.js"></script>
<script src="js/VirtualBoyEffect.js"></script>
```

Construct the effect with a WebGLRenderer instance:

```javascript
var virtualBoyEffect = new THREE.VirtualBoyEffect(renderer);
```

Render by using a virtualBoyEffect instance:

```javascript
function render() {
  requestAnimationFrame(render);
  virtualBoyEffect.render(scene, camera);
}
render();
```

## Licence

[MIT](https://raw.githubusercontent.com/technohippy/VirtualBoyEffect/master/LICENSE.txt)

## Author

[technohippy](https://github.com/technohippy)
