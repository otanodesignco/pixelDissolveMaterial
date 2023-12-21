import React, { useRef } from 'react'
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { BackSide, Color, DoubleSide, FrontSide } from 'three';

export default function PixelRevealMaterial({
        patternSize = 40, // size of the pixel pattern
        patternColor = 0x0082B2, // pattern color
        patternIntensity = 15, // intensity for bloom
        baseColor = 0xFFFFFF, // base color of mesh
        progress = 0, // animation progress
        patternLineSize = 2, // size of the line for the pattern
        axis = 'y', // transition direct
        start = 'top', // start orientation top on x means left
        side = 'both' // side to render
    })
{
    const uniforms =
    {
        uPatternSize: patternSize,
        uProgress: progress,
        uPatternColor: new Color( patternColor).multiplyScalar( patternIntensity ),
        uBaseColor: new Color( baseColor ),
        uPatternWidth: patternLineSize
    }

    // handle axis
    let transitionAxis = 1

    switch( axis.toLowerCase() )
    {
        case 'y':
            transitionAxis = 1
        break;

        case 'x':
            transitionAxis = 2
        break;

        default:
            transitionAxis = 1
        break;
    }

    let transitionDirection = 1

    switch( start.toLowerCase() )
    {
        case 'top':
            transitionDirection = 1
        break;

        case 'left':
            transitionDirection = 1
        break;

        case 'bottom':
            transitionDirection = 2
        break;

        case 'right':
            transitionDirection = 2
        break;

        default:
            transitionDirection = 1
        break;
    }

    let renderedSide = DoubleSide

    switch( side )
    {
        case 'front':
            renderedSide = FrontSide
        break;

        case 'back':
            renderedSide = BackSide
        break;

        case 'both':
            renderedSide = DoubleSide
        break;

        default:
            renderedSide = DoubleSide
        break;
    }

    const vertexShader = /*glsl*/`

    out vec2 vUv;
    out vec3 vWorldPosition;
    out vec3 vView;
    out vec3 vObjectNormals;
    
    void main()
    {
    
      vUv = uv;
      vec4 localPosition = modelMatrix * vec4( position, 1.0 ); // object space coords
      vec4 worldNormal = modelMatrix * vec4( normal, 0.0 ); // normals in object space
      vView = normalize( cameraPosition - localPosition.xyz ); // view position in object space for lambert lighting
      vWorldPosition = localPosition.xyz * 0.45 + 0.5; // corrected position for transition
      vObjectNormals = normalize( worldNormal.xyz ); // normalized object space normals for lambert lighting

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
    }
    `

    const fragmentShader = /*glsl*/`
/* Credit to Harry Alisavakis, original code author for Unity game engine
// Website: https://halisavakis.com/my-take-on-shaders-directional-dissolve/
// Twitter: @HarryAlisavakis
// Copy Right: Harry Alisavakis, 2018 & Rickey Otano, 2023
// License: Free to use and modify, keep this comment in shader code
*/

uniform float uPatternSize;
uniform float uProgress;
uniform vec3 uPatternColor;
uniform vec3 uBaseColor;
uniform float uPatternWidth;

in vec2 vUv;
in vec3 vWorldPosition;
in vec3 vView;
in vec3 vObjectNormals;

// random function
float random(vec2 coords)
{
  return fract( sin( dot( coords, vec2( 12.9898, 78.233 ) ) ) * 43758.5453123 );
}
// lambert lighting
float lambertLighting( vec3 normal, vec3 viewDirection )
{
    return max( dot( normal, viewDirection ), 0.0 );
}

void main()
{

  
  vec2 uv = vUv; // varying vUv saved as uv
  float progress = uProgress; // uniform saved as progress


  // pattern thickness / width multipled by offset for size control
  float patternWith = uPatternWidth * 0.01;

  // calculate the area to clip/hide from view
  vec2 objectUV = vWorldPosition.xy; // world space uv
  float direction = ${ transitionAxis === 1 ? 'objectUV.y;' : 'objectUV.x;' } // transition direction
  direction = ${ transitionDirection === 1 ? 'direction;' : '1.0 - direction;'}

  if( direction - progress < 0.0 ) discard;
  // transition effect
  float transition = step( progress, direction );

  // generate square pattern
  float squares =  step( 0.7, random( floor( uv * uPatternSize ) * progress ) );

  // create emission ring for effect
  float patternRing = step( direction - patternWith, progress ) * squares;

  // lighting & base color, lambert lighting
  float diffuse = lambertLighting( vObjectNormals, vView );
  vec3 baseColor = uBaseColor * diffuse;

  // create color out of emission ring
  vec3 patternColor = uPatternColor * patternRing;

  // mix original color with pixel dissolve based on the emission ring size
  vec3 finalColor = mix( baseColor, patternColor, patternRing );
  // final color with transition using alpha
  gl_FragColor = vec4( finalColor, transition );

}
    `

    
   
    const PixelRevealMaterial = shaderMaterial( uniforms, vertexShader, fragmentShader )

    extend({ PixelRevealMaterial })

    

    return(
        <pixelRevealMaterial
            key={ PixelRevealMaterial.key }
            transparent={ true }
            side={ renderedSide }
        />
    )
}