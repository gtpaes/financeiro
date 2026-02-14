import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import api from "../services/api";
import "./login.css";

function Register() {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ===== THREE.JS (IGUAL AO LOGIN) =====
  useEffect(() => {
    let head, leftArm, rightArm;
    const mouse = new THREE.Vector2(0, 0);

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambLight);

    const loader = new GLTFLoader();
    let model;

    loader.load("/models/scene.glb", (gltf) => {
      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      model.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(14 / maxDim);
      model.rotation.y = Math.PI / -2;
      model.position.y = -10.5;

      model.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(0xffffff); // cor do robô
        }
        if (child.isBone) {
          if (child.name === "mixamorigLeftArm_9") {
            child.rotation.x = -Math.PI / -3;
            child.rotation.z = 0;
            child.rotation.y = -1;
            leftArm = child;
          }
          if (child.name === "mixamorigRightArm_17") {
            child.rotation.x = -Math.PI / -3;
            child.rotation.z = 0;
            child.rotation.y = 1;
            rightArm = child;
          }
          if (child.name === "mixamorigHead_1") head = child;
        }
      });

      scene.add(model);
    });

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
        const animate = () => {
          requestAnimationFrame(animate);
    
          const t = clock.getElapsedTime();
    
          // cabeça seguindo o mouse
          if (head) {
            head.rotation.x = mouse.y * 0.5;
            head.rotation.y = mouse.x * 0.5;
          }
    
          // braços se movendo devagar
          if (leftArm) leftArm.rotation.x = -Math.PI / -3 + Math.sin(t) * 0.1;
          if (rightArm) rightArm.rotation.x = -Math.PI / 10 + Math.cos(t) * 0.8;
    
    
    
          renderer.render(scene, camera);
        };
        animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // ===== REGISTER =====
  async function handleRegister(e) {
    e.preventDefault();

    if (password !== confirm) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.log("ERRO COMPLETO:", error.response);
      alert("Erro ao cadastrar");
    }
  }

  return (
    <div className="login-container">
      <div ref={mountRef} className="three-bg"></div>

      <div className="login-card">
        <h1>Registro</h1>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Nome"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmar senha"
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button type="submit">Cadastrar</button>
        </form>

        <p className="toggle" onClick={() => navigate("/login")}>
          Já tem conta? Clique aqui para fazer login
        </p>
      </div>
    </div>
  );
}

export default Register;