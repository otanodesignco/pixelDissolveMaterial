import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Environment, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { SRGBColorSpace } from "three";


function App() {
  return (
    <Canvas shadows camera={{ position: [3, 3, 5], fov: 42 }} gl={{outputColorSpace: SRGBColorSpace }}>
      <OrbitControls makeDefault />
      <color attach="background" args={["#5c8db5"]} />
      <Experience />
      <EffectComposer>
        <Bloom 
          luminanceThreshold={ 0.7 }
          luminanceSmoothing={ 0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

export default App;
