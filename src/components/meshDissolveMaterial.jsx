import { useRef } from "react"

const fragment = /* glsl */ `

uniform float uNoiseSize;
uniform float uDissolveAmount;

in vec2 vUv;
in vec4 vWorldPosition;

float random(vec2 coords)
{
  return fract( sin( dot( coords, vec2( 12.9898, 78.233 ) ) ) * 43758.5453123 );
}

void main()
{

  vec2 uv = vUv;

  vec4 transitionDirection = vec4( 0., 1., 0., 0.);

  float emissionThreshold = 0.1;

  float clipTest = ( dot( vWorldPosition, normalize( transitionDirection) ) + 1.0 ) / 2.0;

  if( clipTest - uDissolveAmount < 0. ) discard;

  float squares = step( 0.5, random( floor( uv * uNoiseSize ) * uDissolveAmount ) );

  float emissionRing = step( clipTest - emissionThreshold, uDissolveAmount) * squares;

  vec3 color = vec3( emissionRing );


  gl_FragColor = vec4( uv, 0.7, 1.0 );
  gl_FragColor += vec4( color, 1.0 );

}

`

const vertex = /* glsl */ `

out vec2 vUv;
out vec4 vWorldPosition;

void main()
{

  vUv = uv;
  vWorldPosition = modelMatrix * vec4( position, 1.0 );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

`

export function meshDissolveMaterial( { noiseSize=30 })
{
    const uniforms = useRef(
        {
            uNoiseSize: { value: noiseSize }
        }
    )

    return  <>
    
                <shaderMaterial 
                    transparent={true}
                    uniforms={uniforms.current}
                    vertexShader={vertex}
                    fragmentShader={fragment}
                />

            </>
    
}