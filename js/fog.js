(() => {
  const canvas = document.getElementById('fog-canvas');
  if (!canvas) return;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  const vertSrc = `
  attribute vec2 a_position;
  void main(){
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
  `;

  const fragSrc = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_clickPos;
  uniform float u_clickTime;

  // Hash and 2D value noise
  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    float a = hash(i + vec2(0.0,0.0));
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){
    float t = 0.0;
    float a = 0.5;
    for(int i=0;i<5;i++){
      t += noise(p) * a;
      p = p * 2.02 + 13.5;
      a *= 0.5;
    }
    return t;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;     // 0..1
    // Maintain aspect ratio in noise space to avoid stretching
    vec2 p = vec2(uv.x * (u_resolution.x/u_resolution.y), uv.y);

    float t = u_time * 0.06;
    // Slowly drifting fog noise
    float n = fbm(p * 2.8 + vec2(t*0.6, -t*0.4));
    n += 0.25 * fbm(p * 6.0 + vec2(-t*0.9, t*0.7));
    n = smoothstep(0.2, 1.0, n);

    // Base density range (reduced for readability)
    float density = mix(0.08, 0.28, n);

    // Hover lighten effect (reduce fog near mouse)
    float hover = 0.0;
    if(u_mouse.x >= 0.0){
      float d = distance(uv, u_mouse);
      hover = smoothstep(0.3, 0.0, d) * 0.25;  // reduce density near pointer
    }

    // Click pulse: outward ripple that perturbs density
    float pulse = 0.0;
    if(u_clickTime > 0.0){
      float dt = u_time - u_clickTime; // seconds since click
      if (dt < 2.5) {
        float r = distance(uv, u_clickPos);
        float wave = sin(r * 40.0 - dt * 6.0);
        // Radial envelope + temporal fade
        float env = smoothstep(0.25, 0.0, r) * (1.0 - smoothstep(1.0, 2.3, dt));
        pulse = wave * env * 0.08;
      }
    }

    float alpha = clamp(density - hover + pulse, 0.03, 0.28);
    // Slight tint to fog to feel natural
    vec3 fogColor = vec3(0.97, 0.98, 1.0);
    gl_FragColor = vec4(fogColor, alpha);
  }
  `;

  function createShader(type, source){
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }
  const vs = createShader(gl.VERTEX_SHADER, vertSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) { canvas.style.display = 'none'; return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(prog));
    canvas.style.display = 'none';
    return;
  }
  gl.useProgram(prog);

  const posLoc = gl.getAttribLocation(prog, 'a_position');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uClickPos = gl.getUniformLocation(prog, 'u_clickPos');
  const uClickTime = gl.getUniformLocation(prog, 'u_clickTime');

  // Fullscreen triangle (fewer verts, avoids precision edges)
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
      3, -1,
      -1, 3,
    ]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let width = 0, height = 0;
  function resize(){
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (w === width && h === height) return;
    width = w; height = h;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, width, height);
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse uniforms
  let mouse = [-1, -1];
  let clickPos = [0.0, 0.0];
  let clickTime = 0.0;

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = 1.0 - (e.clientY / window.innerHeight); // flip Y for gl_FragCoord
    mouse[0] = x;
    mouse[1] = y;
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = 1.0 - (e.clientY / window.innerHeight);
    clickPos[0] = x;
    clickPos[1] = y;
    clickTime = performance.now() / 1000;
  });

  const start = performance.now();
  function frame(){
    const t = (performance.now() - start) / 1000;
    gl.uniform2f(uRes, width, height);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.uniform2f(uClickPos, clickPos[0], clickPos[1]);
    gl.uniform1f(uClickTime, clickTime);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  frame();
})();
