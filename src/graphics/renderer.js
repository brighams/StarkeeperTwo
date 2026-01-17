import { multiply_matrices, rotate_matrix, translate_matrix } from './math.js'

const vertex_shader_source = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  uniform mat3 u_transform;

  void main() {
    vec2 position = (u_transform * vec3(a_position, 1.0)).xy;
    vec2 clipSpace = ((position / u_resolution) * 2.0) - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`

const fragment_shader_source = `
  precision mediump float;
  uniform vec4 u_color;

  void main() {
    gl_FragColor = u_color;
  }
`

const create_shader = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

const create_program = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

let gl, positionBuffer, positionLocation, transformLocation, colorLocation

export const init_renderer = (canvas) => {
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  if (!gl) {
    alert('WebGL not supported')
    return null
  }

  const vertexShader = create_shader(gl, gl.VERTEX_SHADER, vertex_shader_source)
  const fragmentShader = create_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source)
  const program = create_program(gl, vertexShader, fragmentShader)

  positionLocation = gl.getAttribLocation(program, 'a_position')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  transformLocation = gl.getUniformLocation(program, 'u_transform')
  colorLocation = gl.getUniformLocation(program, 'u_color')

  positionBuffer = gl.createBuffer()

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.useProgram(program)
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height)

  return gl
}

export const clear_screen = () => {
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

export const draw_line = ({x1, y1, x2, y2, transform, color}) => {
  const vertices = new Float32Array([x1, y1, x2, y2])

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix3fv(transformLocation, false, transform)
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3])

  gl.drawArrays(gl.LINES, 0, 2)
}

export const draw_circle = ({x, y, radius, segments, transform, color}) => {
  const vertices = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    vertices.push(x + Math.cos(angle) * radius)
    vertices.push(y + Math.sin(angle) * radius)
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix3fv(transformLocation, false, transform)
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3])

  gl.drawArrays(gl.LINE_STRIP, 0, segments + 1)
}


export const draw_oval = ({x, y, radiusX, radiusY, segments = 32, transform, color}) => {
  const vertices = []
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    vertices.push(x + Math.cos(angle) * radiusX)
    vertices.push(y + Math.sin(angle) * radiusY)
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix3fv(transformLocation, false, transform)
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3])

  gl.drawArrays(gl.LINE_STRIP, 0, segments + 1)
}

export const draw_rect = ({x, y, width, height, transform, color}) => {
  const vertices = new Float32Array([
    x, y,
    x + width, y,
    x + width, y + height,
    x, y + height
  ])

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix3fv(transformLocation, false, transform)
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3])

  gl.drawArrays(gl.LINE_LOOP, 0, 4)
}

export const draw_round_rect = ({x, y, width, height, radius, segments = 8, transform, color}) => {
  const vertices = []

  // Clamp radius to half of smallest dimension
  const maxRadius = Math.min(width, height) / 2
  const r = Math.min(radius, maxRadius)

  // Top-right corner
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * (Math.PI / 2)
    vertices.push(x + width - r + Math.cos(angle) * r)
    vertices.push(y + r - Math.sin(angle) * r)
  }

  // Bottom-right corner
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * (Math.PI / 2) + Math.PI / 2
    vertices.push(x + width - r + Math.cos(angle) * r)
    vertices.push(y + height - r - Math.sin(angle) * r)
  }

  // Bottom-left corner
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * (Math.PI / 2) + Math.PI
    vertices.push(x + r + Math.cos(angle) * r)
    vertices.push(y + height - r - Math.sin(angle) * r)
  }

  // Top-left corner
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * (Math.PI / 2) + Math.PI * 1.5
    vertices.push(x + r + Math.cos(angle) * r)
    vertices.push(y + r - Math.sin(angle) * r)
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix3fv(transformLocation, false, transform)
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3])

  gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2)
}

export const draw_triangle = ({x1, y1, x2, y2, x3, y3, transform, color}) => {
  const vertices = new Float32Array([
    x1, y1,
    x2, y2,
    x3, y3
  ])

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix3fv(transformLocation, false, transform)
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3])

  gl.drawArrays(gl.LINE_LOOP, 0, 3)
}

export const draw_spark = ({x, y, angle, size, transform, color}) => {
  const rotation_speed = 8.0
  const animated_angle = angle + (performance.now() / 1000) * rotation_speed

  const spark_transform = multiply_matrices(
    multiply_matrices(transform, translate_matrix(x, y)),
    rotate_matrix(animated_angle)
  )

  for (let i = 0; i < 3; i++) {
    const line_angle = (i * Math.PI) / 3 // 0°, 60°, 120°
    const cos_a = Math.cos(line_angle)
    const sin_a = Math.sin(line_angle)

    const x1 = -size * cos_a
    const y1 = -size * sin_a
    const x2 = size * cos_a
    const y2 = size * sin_a

    draw_line({x1, y1, x2, y2, spark_transform, color})
  }
}

export const create_polygon = () => {
  return {
    vertices: [],
    filled: false,
    closed: false,
    color: null,
    animation: {
      rotation_speed: 0,
      pulse_speed: 0,
      pulse_amplitude: 0.1,
      color_pulse_speed: 0,
      fade_speed: 0,
    },
  }
}

export const draw_polygon = ({polygon, transform, time = performance.now() / 1000}) => {
  if (!polygon || !polygon.vertices || polygon.vertices.length < 2) {
    return
  }

  let final_transform = transform
  let final_color = polygon.color || [1, 1, 1, 1]

  if (polygon.animation) {
    const anim = polygon.animation

    if (anim.rotation_speed !== undefined) {
      const angle = (anim.rotation_offset || 0) + time * anim.rotation_speed
      final_transform = multiply_matrices(
        multiply_matrices(transform, translate_matrix(polygon.x || 0, polygon.y || 0)),
        rotate_matrix(angle)
      )
    }

    if (anim.pulse_speed !== undefined) {
      const scale = 1 + Math.sin(time * anim.pulse_speed) * (anim.pulse_amplitude || 0.1)
      const scale_matrix = [
        scale, 0, 0,
        0, scale, 0,
        0, 0, 1
      ]
      final_transform = multiply_matrices(final_transform, scale_matrix)
    }

    if (anim.color_pulse_speed !== undefined) {
      const intensity = 0.5 + 0.5 * Math.sin(time * anim.color_pulse_speed)
      const base_color = polygon.color || [1, 1, 1, 1]
      final_color = [
        base_color[0] * intensity,
        base_color[1] * intensity,
        base_color[2] * intensity,
        base_color[3]
      ]
    }

    if (anim.fade_speed !== undefined) {
      const alpha = 0.5 + 0.5 * Math.sin(time * anim.fade_speed)
      final_color = [...final_color]
      final_color[3] = (polygon.color?.[3] || 1) * alpha
    }
  }

  const vertices = new Float32Array(polygon.vertices)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.uniformMatrix3fv(transformLocation, false, final_transform)
  gl.uniform4f(colorLocation, final_color[0], final_color[1], final_color[2], final_color[3])

  const mode = polygon.filled ? gl.TRIANGLE_FAN : (polygon.closed ? gl.LINE_LOOP : gl.LINE_STRIP)
  gl.drawArrays(mode, 0, polygon.vertices.length / 2)
}
