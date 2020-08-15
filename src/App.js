import React, { useRef, useState, useEffect, Suspense } from "react";
import "./App.css";
import { Canvas, useFrame, useLoader } from "react-three-fiber";
import { useSpring, a } from "react-spring/three"
import { OrbitControls, MeshWobbleMaterial } from "drei";
import {map, noise} from "./PerlinNoise"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import gltfModel from "./PS-Controller-classic.glb"

function WobbleBox({position, color}) {
  return(
    <mesh position={position}>
      <boxGeometry attach='geometry' args={[1,3,1]} />
      <MeshWobbleMaterial attach='material' color={color} speed={3} factor={0.5}/>
    </mesh>
  )
}

function Box({ position, color }) {
  let [expand, setExpand] = useState(false);
  let refMesh = useRef();

  const handleClick = () => {
    setExpand(!expand);
  };

  useFrame(() => {
    refMesh.current.rotation.x = refMesh.current.rotation.y += 0.01;
  });

  const props = useSpring({
    scale: expand ? [2,2,2] : [1,1,1],
  })

  return (
    <a.mesh
      ref={refMesh}
      scale={props.scale}
      position={position}
      onClick={handleClick}
    >
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <MeshWobbleMaterial
        attach="material"
        color={color}
        speed={3}
        factor={0.5}
      />
    </a.mesh>
  );
}

function Floor() {
  let refPlane = useRef();
  let [vertices, setVertices] = useState([]);

  useEffect(() => {
    generateTerrain();
  },[])

  let offset = 0.5;
  useFrame(() => {
    vertices.forEach((vertice,idx) => {
      let planeIndex = Math.floor((idx + offset) % vertices.length)
      refPlane.current.vertices[planeIndex].z = vertice;
    });

    offset += 0.5;
    refPlane.current.verticesNeedUpdate = true;
  })

  const generateTerrain = () => {
    let planeVertices = refPlane.current.vertices;
    let smooth = 5;
    for(let i = 0; i < planeVertices.length; i++) {
      let {x,y,z} = planeVertices[i];
      let noiseVal = map(noise(x/smooth, (z+y)/smooth), 0, 0.8, 0, 4);
      setVertices((old) => [...old, noiseVal]);
      refPlane.current.vertices[i].z = noiseVal;
    }
  }

  return (
    <mesh
      position={[0, 0.05, 0]}
      rotation={[(70 * Math.PI) / 180, 0, (90 * Math.PI) / 180]}
    >
      <planeGeometry ref={refPlane} attach="geometry" args={[15, 30, 100, 100]} />
      <meshBasicMaterial attach="material" color="red" wireframe />
    </mesh>
  );
}

function Model() {
  let gltf = useLoader(GLTFLoader, gltfModel);
  return(
    <primitive object={gltf.scene} />
  )
}

function App() {
  return (
    <div className="App">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-2, 0, 0]} color="red" />    
        <WobbleBox position={[0,0,0]} color="green"/>
        <Box position={[2, 0, 0]} color="#ffaa00" />
        <Suspense fallback="Loading...">
          <Model/>
        </Suspense>
        <Floor />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
