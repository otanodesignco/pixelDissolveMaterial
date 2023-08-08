# pixelDissolveMaterial
Pixel dissolve material for three.js. Shader will dissolve the mesh using a particle transition that looks like pixilation.

This code is originally from https://halisavakis.com/my-take-on-shaders-directional-dissolve/ by Harry Alisavakis for unity

This GLSL Shader code is a port from the original unity code for threejs and react-three-fiber.

demo https://pixel-dissolve.vercel.app/

![Effect Image 1](https://github.com/otanodesignco/pixelDissolveMaterial/blob/main/pixel.png?raw=true)

![Effect Image 2](https://github.com/otanodesignco/pixelDissolveMaterial/blob/main/pixel2.png?raw=true)

Known Issues

- issue where progress has to scale beyond 1 based on the mesh size
