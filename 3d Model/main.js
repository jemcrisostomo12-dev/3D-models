import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const mount = document.querySelector("#scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#f8e6cc");
scene.fog = new THREE.Fog("#f8e6cc", 25, 55);

const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(13, 10, 17);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
mount.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 11;
controls.maxDistance = 28;
controls.maxPolarAngle = Math.PI * 0.48;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;

scene.add(new THREE.HemisphereLight("#fff1da", "#a8795a", 2.1));
const sun = new THREE.DirectionalLight("#ffd2a0", 3.1);
sun.position.set(-8, 15, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -17; sun.shadow.camera.right = 17;
sun.shadow.camera.top = 17; sun.shadow.camera.bottom = -17;
sun.shadow.normalBias = 0.035;
scene.add(sun);

const mat = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const cream = mat("#f7d9a6"), brick = mat("#6b3420"), red = mat("#d62300"), orange = mat("#ff8732"), blue = mat("#0033a0");
const dark = mat("#3a2216"), green = mat("#5f7f3c"), glass = mat("#6f9fcf", 0.28, { metalness: 0.12 });
const trim = mat("#fff1d6"), asphalt = mat("#6d655f"), concrete = mat("#e8d5b8");

function box(parent, name, size, position, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  parent.add(mesh);
  return mesh;
}
function cylinder(parent, name, radiusTop, radiusBottom, height, position, material, segments = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.name = name; mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
  return mesh;
}
function labelTexture(title, subtitle) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff1d6"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#d62300"; ctx.fillRect(0, 0, 20, canvas.height);
  ctx.fillStyle = "#502314"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "bold 92px Georgia, serif"; ctx.fillText(title, 520, 105);
  ctx.font = "bold 25px Arial, sans-serif"; ctx.letterSpacing = "8px"; ctx.fillText(subtitle, 520, 197);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function sign(parent, title, subtitle, width, height, position, rotationY = 0) {
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({
    map: labelTexture(title, subtitle), roughness: 0.68
  }));
  face.position.set(...position); face.rotation.y = rotationY; parent.add(face);
  return face;
}

const world = new THREE.Group();
scene.add(world);
// Ground, curb, and a quiet two-lane road establish the roadside setting.
box(world, "site", [44, 0.2, 36], [0, -0.22, 0], mat("#d6c2a0"), { castShadow: false });
box(world, "parking apron", [28, 0.12, 17], [0, -0.07, 3], concrete, { castShadow: false });
box(world, "road", [44, 0.12, 7], [0, -0.06, 13], asphalt, { castShadow: false });
box(world, "road edge", [44, 0.18, 0.22], [0, 0.03, 9.35], trim, { castShadow: false });
box(world, "walkway", [24, 0.1, 2], [0, 0.02, 5.1], mat("#f4e3c6"), { castShadow: false });
for (let x = -17; x <= 17; x += 4) box(world, "road marking", [2, 0.015, 0.12], [x, 0.01, 13], mat("#e7dfc8"), { castShadow: false });
for (let x = -10; x <= 10; x += 4) {
  box(world, "parking line", [0.07, 0.015, 4], [x, 0.01, 3], mat("#f0e9d8"), { castShadow: false });
}

const building = new THREE.Group();
world.add(building);
// Main restaurant volume and warm brick base.
box(building, "brick plinth", [12.4, 1.25, 7.4], [0, 0.83, 0], brick);
box(building, "cream upper walls", [12.1, 3.2, 7.1], [0, 3.05, 0], cream);
box(building, "front brick band", [12.2, 0.22, 0.17], [0, 1.5, 3.68], orange);
box(building, "rear brick band", [12.2, 0.22, 0.17], [0, 1.5, -3.68], orange);
box(building, "left brick band", [0.17, 0.22, 7.3], [-6.15, 1.5, 0], orange);
box(building, "right brick band", [0.17, 0.22, 7.3], [6.15, 1.5, 0], orange);

// Flat roof, parapet and a red-edged fascia.
box(building, "roof slab", [12.9, 0.28, 7.9], [0, 4.77, 0], blue);
box(building, "front fascia", [12.9, 0.24, 0.18], [0, 4.53, 3.91], red);
box(building, "side fascia", [0.18, 0.24, 7.8], [6.42, 4.53, 0], red);
box(building, "roof coping", [13.05, 0.12, 8.02], [0, 4.95, 0], trim);

// Front windows and a centered glazed entry.
for (const x of [-4.3, -1.95, 1.95, 4.3]) {
  box(building, "front window frame", [1.88, 1.72, 0.15], [x, 2.88, 3.61], dark);
  box(building, "front window glass", [1.62, 1.46, 0.04], [x, 2.9, 3.71], glass);
  box(building, "window mullion", [0.055, 1.42, 0.055], [x, 2.9, 3.75], trim);
  box(building, "window sill", [2.02, 0.12, 0.27], [x, 1.98, 3.7], trim);
}
box(building, "entry frame", [1.52, 2.25, 0.2], [0, 2.62, 3.62], dark);
box(building, "entry glass", [1.22, 1.94, 0.045], [0, 2.65, 3.74], glass);
box(building, "entry door split", [0.045, 1.9, 0.06], [0, 2.65, 3.78], trim);
cylinder(building, "door handle", 0.035, 0.035, 0.08, [0.43, 2.55, 3.83], trim, 8).rotation.z = Math.PI / 2;
box(building, "front sign board", [4.1, 0.98, 0.2], [0, 4.0, 3.77], red);
sign(building, "BURGER & CO.", "GOOD FOOD · GOOD NEIGHBORS", 3.8, 0.75, [0, 4.0, 3.89]);

// Drive-through window on the right-side wall.
box(building, "drive thru surround", [0.2, 1.55, 2.35], [6.18, 2.72, -0.5], dark);
box(building, "drive thru glass", [0.055, 1.2, 2.0], [6.3, 2.72, -0.5], glass);
box(building, "service counter", [0.58, 0.12, 2.65], [6.45, 1.98, -0.5], trim);
box(building, "drive thru canopy", [1.15, 0.15, 3.4], [6.55, 3.63, -0.5], orange);
box(building, "canopy underside", [1.04, 0.05, 3.2], [6.56, 3.53, -0.5], trim);
box(building, "side menu board", [0.12, 1.05, 1.2], [6.25, 2.9, -2.35], blue);
box(building, "menu inset", [0.04, 0.82, 0.95], [6.33, 2.9, -2.35], trim);
box(building, "menu header", [0.045, 0.18, 0.85], [6.37, 3.2, -2.35], red);

// A compact order post and lane guides.
cylinder(world, "order post", 0.1, 0.12, 1.35, [9.5, 0.67, -2.4], dark);
box(world, "order speaker", [0.72, 0.65, 0.4], [9.5, 1.62, -2.4], blue);
box(world, "speaker face", [0.03, 0.38, 0.24], [9.88, 1.62, -2.4], dark);
cylinder(world, "lane bollard", 0.11, 0.14, 0.75, [8.4, 0.38, -1.3], red);
cylinder(world, "lane bollard", 0.11, 0.14, 0.75, [10.6, 0.38, -1.3], red);
box(world, "drive lane stripe", [0.12, 0.018, 12], [9.5, 0.02, 4], mat("#eadfbd"));
box(world, "drive lane stripe", [0.12, 0.018, 9], [11.4, 0.02, -1.8], mat("#eadfbd"));
box(world, "drive lane connector", [1.9, 0.018, 0.12], [10.45, 0.02, -6.3], mat("#eadfbd"));

// Freestanding roadside sign.
box(world, "sign base", [1.35, 0.36, 0.75], [-9.3, 0.18, 2.4], brick);
cylinder(world, "sign pole", 0.1, 0.14, 2.3, [-9.3, 1.48, 2.4], dark);
box(world, "roadside sign", [2.5, 1.2, 0.22], [-9.3, 3.05, 2.4], red);
sign(world, "BURGER", "OPEN DAILY", 2.22, 0.95, [-9.3, 3.05, 2.53]);

// Planter beds, shrubs, and stylized trees.
const shrubMat = mat("#7f9c4e");
function tree(x, z, scale = 1) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.scale.setScalar(scale); world.add(group);
  cylinder(group, "tree trunk", 0.18, 0.28, 1.7, [0, 0.85, 0], mat("#806147"), 8);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), green);
  crown.name = "tree crown"; crown.position.set(0, 2.3, 0); crown.scale.set(1, 1.12, 0.94);
  crown.castShadow = true; crown.receiveShadow = true; group.add(crown);
  const crown2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), shrubMat);
  crown2.position.set(0.48, 2.45, 0.16); crown2.castShadow = true; group.add(crown2);
}
for (const [x, z] of [[-13, -5], [-8, -8], [-2, -9], [5, -9], [14, -5], [16, 5], [-15, 6]]) tree(x, z, 0.9 + (Math.abs(x) % 3) * 0.1);
for (const x of [-5.2, 5.2]) {
  box(world, "front planter", [1.35, 0.48, 0.85], [x, 0.24, 4.4], brick);
  for (let i = 0; i < 3; i++) {
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.37, 1), shrubMat);
    bush.position.set(x - 0.4 + i * 0.4, 0.73, 4.4); bush.scale.set(1.15, 0.9, 0.9); bush.castShadow = true; world.add(bush);
  }
}

// Small patio table and two stools add a human scale to the entry.
cylinder(world, "patio table base", 0.11, 0.15, 0.72, [-7.2, 0.36, 4.3], dark);
cylinder(world, "patio table top", 0.72, 0.72, 0.12, [-7.2, 0.78, 4.3], trim);
for (const x of [-8.05, -6.35]) {
  cylinder(world, "patio stool", 0.26, 0.26, 0.5, [x, 0.25, 4.3], orange);
}

// Soft, oversized shadow-catching ground plane behind the site.
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#d6c2a0"));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.34; floor.receiveShadow = true; scene.add(floor);

document.querySelector("#reset").addEventListener("click", () => {
  camera.position.set(13, 10, 17); controls.target.set(0, 1.5, 0); controls.update();
});
document.querySelector("#spin").addEventListener("click", (event) => {
  controls.autoRotate = !controls.autoRotate;
  event.currentTarget.style.color = controls.autoRotate ? "var(--blue)" : "var(--ink)";
});
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
requestAnimationFrame(() => document.querySelector("#loading").classList.add("hidden"));
