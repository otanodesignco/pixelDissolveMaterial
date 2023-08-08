import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Environment, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";


function App() {
  return (
    <Canvas shadows camera={{ position: [3, 3, 5], fov: 42 }}>
      <OrbitControls makeDefault />
      <color attach="background" args={["#5c8db5"]} />
      <Experience />
      <Environment preset="sunset" />
      <EffectComposer>
        <Bloom 
          luminanceThreshold={ 1 }
          intensity={ 1.5 }
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

export default App;
