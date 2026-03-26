struct VsOut {
    @builtin(position) position : vec4f,
    @location(0) color : vec3f
};

@group(0) @binding(0) var<uniform> u_params : vec4f;

@vertex
fn vs_main(@location(0) a_pos : vec3f, @location(1) a_col : vec3f) -> VsOut {
    var out : VsOut;
    // *** TODO_A1 : Task 3b
    // Extend the vertex stage to process 3D positions for the tetra geometry.
    // Hint: change the position input (^) to vec3f and propagate z to clip-space. (as in, get rid of the hard-coded 0.0 value that used to be on line 16)
    // WebGPU clip-space z is in [0, 1], unlike legacy WebGL [-1, 1]. // Where 0 is closest to the camera, and 1 is further away. Meaning THAT'S why the top of my tetrahedron was cut off!!
    // --- begin code ---
    out.position = vec4f(a_pos, 1.0);
    out.position[2] = out.position[2] + 1;
    // --- end code ---
    out.color = a_col;
    return out;
}

@fragment
fn fs_main(@location(0) color : vec3f) -> @location(0) vec4f {
    let alpha = u_params.x;
    return vec4f(color, alpha);
}
