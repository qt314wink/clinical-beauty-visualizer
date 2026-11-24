import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
uniform float uTime; uniform float uProgress;
varying vec3 vNormal; varying vec3 vView;
float hash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){float freq=mix(2.6,1.3,uProgress);float amp=mix(0.18,0.055,uProgress);float n=noise3(position*freq+uTime*mix(0.45,0.16,uProgress));float d=(n-0.5)*2.0*amp;vec3 displaced=position+normal*d;vec4 mv=modelViewMatrix*vec4(displaced,1.0);vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}
`;
const fragmentShader = /* glsl */ `
uniform float uProgress;varying vec3 vNormal;varying vec3 vView;
void main(){vec3 n=normalize(vNormal);vec3 view=normalize(vView);float rim=pow(1.0-abs(dot(n,view)),3.2);float light=dot(n,normalize(vec3(0.5,0.8,0.6)))*0.5+0.5;vec3 clay=vec3(0.76,0.52,0.45);vec3 sage=vec3(0.45,0.59,0.53);vec3 base=mix(clay,sage,uProgress);vec3 edge=mix(vec3(0.88,0.72,0.66),vec3(0.76,0.85,0.80),uProgress);vec3 col=mix(base*(0.68+light*0.36),edge,rim*0.42);gl_FragColor=vec4(col,1.0);}
`;
function Cell({ progress, motion }: {progress:number;motion:boolean}) {
 const mesh=useRef<THREE.Mesh>(null);
 const uniforms=useMemo(()=>({uTime:{value:0},uProgress:{value:progress}}),[]);
 useFrame(({clock})=>{uniforms.uProgress.value=progress;uniforms.uTime.value=motion?clock.elapsedTime:0;if(mesh.current && motion)mesh.current.rotation.y+=0.0015;});
 return <group position={[1.15,0,0]}><mesh ref={mesh}><icosahedronGeometry args={[1.35,5]}/><shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms}/></mesh><Ligands progress={progress} motion={motion}/><Html position={[0.8,1.1,0.5]} center distanceFactor={9}><div className="callout">Membrane · procedural GLSL</div></Html></group>;
}
function Ligands({progress,motion}:{progress:number;motion:boolean}){
 const points=useRef<THREE.Points>(null);
 const data=useMemo(()=>{const dirs:THREE.Vector3[]=[];const positions=new Float32Array(80*3);for(let i=0;i<80;i++){const z=1-2*(i+0.5)/80;const a=i*2.399963;const r=Math.sqrt(1-z*z);dirs.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,z));}return {dirs,positions};},[]);
 useFrame(({clock})=>{const attr=points.current?.geometry.attributes.position as THREE.BufferAttribute|undefined;if(!attr)return;const t=motion?clock.elapsedTime:0;data.dirs.forEach((d,i)=>{const radius=THREE.MathUtils.lerp(2.4+(i%9)*0.12,1.49,progress);const a=t*0.12+(i%7)*0.05;attr.setXYZ(i,(d.x*Math.cos(a)-d.z*Math.sin(a))*radius,d.y*radius,(d.x*Math.sin(a)+d.z*Math.cos(a))*radius);});attr.needsUpdate=true;});
 return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.positions,3]}/></bufferGeometry><pointsMaterial color="#547c68" size={0.045} sizeAttenuation transparent opacity={0.8} depthWrite={false}/></points>;
}
function Vial({progress}:{progress:number}){
 const label=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d')!;x.fillStyle='#fcfbf7';x.fillRect(0,0,512,256);x.fillStyle='#3f6254';x.fillRect(0,0,512,20);x.fillStyle='#1c2421';x.font='bold 28px Arial';x.fillText('FORMULATION STUDY',25,75);x.font='bold 21px Arial';x.fillText('FICTIONAL PRODUCT',25,120);x.font='18px Arial';x.fillText('NOT A MEDICAL PRODUCT',25,168);x.fillText('NO CLINICAL DATA',25,204);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;},[]);
 return <group position={[-1.55,-0.1,0]} rotation={[0,-0.35,-0.09]}><mesh><cylinderGeometry args={[0.47,0.47,1.5,48]}/><meshPhysicalMaterial color="#f4f2ec" metalness={0.05} roughness={0.38} transmission={0.68} thickness={0.35} ior={1.45}/></mesh><mesh position={[0,0.87,0]}><cylinderGeometry args={[0.28,0.28,0.28,40]}/><meshStandardMaterial color="#c9c2b2" metalness={0.72} roughness={0.38}/></mesh><mesh position={[0,1.04,0]}><cylinderGeometry args={[0.28,0.28,0.07,40]}/><meshStandardMaterial color="#4a6b5d" metalness={0.3} roughness={0.42}/></mesh><mesh position={[0,-0.7+0.59*(1-progress*0.7),0]} scale={[1,1-progress*0.7,1]}><cylinderGeometry args={[0.39,0.39,1.18,40]}/><meshStandardMaterial color="#8aa396" roughness={0.38} transparent opacity={0.68}/></mesh><mesh position={[0,-0.05,0]}><cylinderGeometry args={[0.476,0.476,0.77,64,1,true,-Math.PI*0.45,Math.PI*0.9]}/><meshStandardMaterial map={label} roughness={0.55} side={THREE.DoubleSide}/></mesh><Html position={[-0.2,1.28,0.4]} center distanceFactor={9}><div className="callout">Concept vial · fictional label</div></Html></group>;
}
function Scene({progress,motion}:{progress:number;motion:boolean}){
 return <Canvas dpr={[1,1.6]} camera={{position:[0,0.1,7.4],fov:45}} gl={{antialias:true,powerPreference:'high-performance'}} fallback={<div className="fallback">WebGL unavailable. Use the timeline controls to explore the illustrative stages.</div>}><color attach="background" args={['#f6f4ef']}/><ambientLight intensity={1.25}/><directionalLight position={[3,5,6]} intensity={1.15} color="#fffdf8"/><pointLight position={[-3,2,2]} color="#e7eee7" intensity={1.0}/><Vial progress={progress}/><Cell progress={progress} motion={motion}/><OrbitControls enablePan={false} enableDamping minDistance={5} maxDistance={11} enableZoom autoRotate={false}/></Canvas>;
}
export default function App(){
 const [progress,setProgress]=useState(0.45);const [motion,setMotion]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const stage=progress<0.33?'Baseline':progress<0.72?'Interaction':'Settled state';
 return <main className="app"><div className="scene"><Scene progress={progress} motion={motion}/></div><header className="top"><div className="eyebrow">INTERACTIVE WEBGL STUDY · REACT THREE FIBER</div><h1>Cellular Material Study</h1><p>An interactive material exploration for a fictional wellness experience.</p></header><section className="panel" aria-label="Visualization controls"><div className="panelhead"><span>Visual response progression</span><strong>{stage}</strong></div><label htmlFor="timeline">Illustrative timeline: {Math.round(progress*100)}%</label><input id="timeline" type="range" min="0" max="100" step="1" value={Math.round(progress*100)} onChange={e=>setProgress(Number(e.target.value)/100)}/><div className="ticks"><span>Dispersed</span><span>Binding motif</span><span>Clustered</span></div><div className="actions"><button type="button" onClick={()=>setMotion(v=>!v)} aria-pressed={motion}>{motion?'Pause motion':'Enable motion'}</button><button type="button" onClick={()=>setProgress(0.45)}>Reset</button></div><p className="note">Illustrative visual states only. No clinical data, pharmacology, dosage, receptor measurements, or treatment outcomes are represented.</p></section><div className="hint">Drag to orbit · Scroll to zoom</div></main>;
}