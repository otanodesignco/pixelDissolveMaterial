import { useControls } from "leva";
import PixelRevealMaterial from "./PixelRevealMaterial.jsx";

export const Experience = () => 
{

  // controls
  const { Size, Progress, Width, dissolveColor, Start, baseColor, Axis } = useControls(
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
        step: 0.01
      },
      Width:
      {
        value: 4,
        min: 1,
        max: 20,
        step: 0.01
      },
      dissolveColor:
      {
        value: '#0082B2'
      },
      baseColor:
      {
        value: '#FFFFFF'
      },
      Start:
      {
        value: 'top',
        options: ['top', 'bottom', 'left', 'right']
      },
      Axis:
      {
        options: ['y','x'],
        value: 'y'
      }
    }
  )

  return (
    <>
      
      <mesh>
        <boxGeometry
        args={[2,2,2]}
        />

        <PixelRevealMaterial
          patternColor={ dissolveColor}
          patternLineSize={ Width }
          patternIntensity={ 30 }
          patternSize={ Size }
          baseColor={ baseColor }
          progress={ Progress }
          axis={ Axis }
          start={ Start }
        />
      </mesh>
    </>
  );
};
