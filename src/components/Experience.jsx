import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import { Color, MeshStandardMaterial, Vector3 } from "three";
import CSM from 'three-custom-shader-material'

const originalMaterial = new MeshStandardMaterial({ color: '0xfefefe'})

const fragment = /* glsl */ `

uniform float uNoiseSize;
uniform float uDissolveAmount;
uniform vec3 uColor;
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

  // calculate the area to clip/hide from view

  float clipTest = ( dot( vWorldPosition, normalize( transitionDirection) ) + 1.0 ) / 2.0;

  // discard fragments that are less than 0.0

  if( clipTest - uDissolveAmount < 0. ) discard;

  // generate square pattern

  float squares =  step( 0.7, random( floor( uv * uNoiseSize ) * uDissolveAmount ) );

  // create cliped ring

  float emissionRing = step( clipTest - emissionThreshold, uDissolveAmount ) * squares;


  // create color out of emission ring

  vec4 emissionColor = vec4( vec3( emissionRing ), 1.0);

  emissionColor *= vec4( uDissolveColor, 1.0 );



  vec4 color = mix( vec4( uColor, 1.0 ), emissionColor, emissionRing );

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

  vWorldPosition = vec3(modelMatrix * vec4( position, 1.0 )).xyz;


  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

`


export const Experience = () => 
{

  const { Size, Dissolve, Width } = useControls(
    {
      Size: 
      {
        value: 30,
        min: 10,
        max: 50,
        step: 0.001
      },
      Dissolve:
      {
        value: 1,
        min: 0,
        max: 1,
        step: 0.001
      },
      Width:
      {
        value: 8,
        min: 1,
        max: 20,
        step: 0.01
      }
    }
  )

  const uniforms = useRef(
    {
      uNoiseSize: { value: 40 },
      uDissolveAmount: { value: 1 },
      uColor: { value: new Color('#e07c63') },
      uDissolveColor: { value: new Color('#FEFEFE').multiplyScalar(50)},
      uDissolveDirection: { value: new Vector3( 0, 1, 0 ) },
      uDissolveWidth: { value: 8 }
    }
  )

  useFrame(() =>
  {

    uniforms.current.uNoiseSize.value = Size
    uniforms.current.uDissolveAmount.value = Dissolve
    uniforms.current.uDissolveWidth.value = Width

    console.log(uniforms.current.uNoiseSize.value)

  })
  
  return (
    <>
      
      <mesh>
        <boxGeometry
          args={[1.5,1.5,1.5]}
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
