import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import api from "../services/api";
import "./login.css";

function Login() {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let head, leftArm, rightArm;
    const mouse = new THREE.Vector2(0, 0);

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    // ===== CÂMERA =====
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // ===== RENDERER =====
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ===== LUZES =====
    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambLight);


    // ===== CARREGAR MODELO =====
    const loader = new GLTFLoader();
    let model;

    loader.load("/models/scene.glb", (gltf) => {
      model = gltf.scene;

      // centraliza e escala
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(14 / maxDim);
      model.rotation.y = Math.PI / -2;
      model.position.y = -10.5;

      // colore meshes e pega ossos
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
            child.rotation.x = -Math.PI / -2;
            child.rotation.z = 0;
            child.rotation.y = 1;
            rightArm = child;
          }
          if (child.name === "mixamorigHead_1") head = child;
        }
      });

      scene.add(model);
    });

    // ===== MOVIMENTO MOUSE =====
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ===== ANIMAÇÃO =====
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

    // ===== RESIZE =====
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ===== LOGIN =====
  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.log("ERRO COMPLETO:", error.response);
      alert("Erro no login");
    }
  }

  return (
    <div className="login-container">
      <div ref={mountRef} className="three-bg"></div>

      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
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
          </div>
          <button type="submit">Entrar</button>
        </form>

        {/* LINK PARA REGISTRO */}
        <p className="toggle" onClick={() => navigate("/register")}>
          Não tem cadastro? Clique aqui para se registrar!
        </p>
      </div>
    </div>
  );
}

export default Login;