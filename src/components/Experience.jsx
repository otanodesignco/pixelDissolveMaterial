import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import { Color, DoubleSide, MeshStandardMaterial, Vector3 } from "three";
import CSM from 'three-custom-shader-material'

const originalMaterial = new MeshStandardMaterial({ color: 'white', side: DoubleSide})

const fragment = /* glsl */ `

/* Credit to Harry Alisavakis, original code author for Unity game engine
// Website: https://halisavakis.com/my-take-on-shaders-directional-dissolve/
// Twitter: @HarryAlisavakis
// Copy Right: Harry Alisavakis, 2018 & Rickey Otano, 2023
// License: Free to use and modify, keep this comment in shader code
*/

uniform float uNoiseSize;
uniform float uProgress;
uniform vec3 uDissolveColor;
uniform vec3 uDissolveDirection;
uniform float uDissolveWidth;

in vec2 vUv;
in vec3 vWorldPosition;

// random function

float random(vec2 coords)
{
  return fract( sin( dot( coords, vec2( 12.9898, 78.233 ) ) ) * 43758.5453123 );
}

void main()
{

  // save varying to local

  vec2 uv = vUv;

  // vec3 for transform direction

  vec3 transitionDirection = uDissolveDirection;

  // emission threshold for color increase value

  float emissionThreshold = uDissolveWidth * 0.01;

  float progress = uProgress;

  // calculate the area to clip/hide from view

  float clipTest =  ( 1.0 + dot( vWorldPosition , normalize( transitionDirection ) ) ) / 2.0;


  // discard fragments that are less than 0.0

  if( clipTest - progress < 0.0 ) discard;

  // generate square pattern

  float squares =  step( 0.7, random( floor( uv * uNoiseSize ) * progress ) );

  // create cliped ring

  float emissionRing = step( clipTest - emissionThreshold, progress ) * squares;


  // create color out of emission ring

  vec4 emissionColor = vec4( vec3( emissionRing ), 1.0);

  emissionColor *= vec4( uDissolveColor, 1.0 );



  vec4 color = mix( csm_DiffuseColor.rgba, emissionColor, emissionRing );

  // gl_FragColor = vec4( color );
  csm_DiffuseColor = color;

}

`

const vertex = /* glsl */ `

out vec2 vUv;
out vec3 vWorldPosition;

void main()
{

  // save uv as varying

  vUv = uv;

  // world coordinates

  vec4 localPosition = modelMatrix * vec4( position, 1.0 );

  vWorldPosition = normalize( localPosition.xyz );


  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

`
// direction vectors for animation

const directions =
{
  top: new Vector3( 0, 1, 0 ),
  bottom: new Vector3( 0, -1, 0 ),
  left: new Vector3( 1, 0, 0 ),
  right: new Vector3( -1, 0, 0 )
}

export const Experience = () => 
{

  // controls
  const { Size, Progress, Width, Start } = useControls(
    {
      Size: 
      {
        value: 15,
        min: 10,
        max: 50,
        step: 0.001
      },
      Progress:
      {
        value: 1,
        min: 0,
        max: 1,
        step: 0.001
      },
      Width:
      {
        value: 4,
        min: 1,
        max: 20,
        step: 0.01
      },
      Start:
      {
        value: 'Top',
        options: ['Top', 'Bottom', 'Left', 'Right']
      }
    }
  )

  const uniforms = useRef(
    {
      uNoiseSize: { value: 40 },
      uProgress: { value: 1 },
      uDissolveColor: { value: new Color('#0082B2').multiplyScalar(15)},
      uDissolveDirection: { value: new Vector3( 0, 1, 0 ) },
      uDissolveWidth: { value: 8 },
    }
  )


  useFrame(( ) =>
  {

    uniforms.current.uNoiseSize.value = Size
    uniforms.current.uProgress.value = Progress
    uniforms.current.uDissolveWidth.value = Width

    switch( Start )
    {
      case 'Top':
        uniforms.current.uDissolveDirection.value = directions.top
      break

      case 'Bottom':
        uniforms.current.uDissolveDirection.value = directions.bottom
      break

      case 'Left':
        uniforms.current.uDissolveDirection.value = directions.left
      break

      case 'Right':
        uniforms.current.uDissolveDirection.value = directions.right
      break

      default:
        uniforms.current.uDissolveDirection.value = directions.top
      break
    }


  })

  
  return (
    <>
      
      <mesh>
        <boxGeometry
          args={[2,2,2]}
        />

        <CSM 
          baseMaterial={ originalMaterial }
          vertexShader={ vertex }
          fragmentShader={ fragment }
          uniforms={ uniforms.current }
          transparent
        />
        
      </mesh>
    </>
  );
};
