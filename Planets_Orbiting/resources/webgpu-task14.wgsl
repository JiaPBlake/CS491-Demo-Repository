struct VsOut {
    @builtin(position) position : vec4f,
    @location(0) noiseColor : vec3f
};

@group(0) @binding(0) var<uniform> u_material : vec4f;
@group(0) @binding(1) var<uniform> u_modelview : mat4x4f;
@group(0) @binding(2) var<uniform> u_taskFlags : vec4f;

@vertex
fn vs_main(@location(0) a_pos : vec3f, @location(1) a_noise : vec3f) -> VsOut {
    var out : VsOut;

    let clipPos = u_modelview * vec4f(a_pos, 1.0);

    // Legacy clip-space z is [-1,1], WebGPU clip-space z is [0,1].
    let z_webgpu = clipPos.z * 0.5 + 0.5;

    out.position = vec4f(clipPos.x, clipPos.y, z_webgpu, clipPos.w);
    out.noiseColor = a_noise;
    return out;
}

@fragment
fn fs_main(@location(0) noiseColor : vec3f) -> @location(0) vec4f {
    if (u_taskFlags.x < 0.5) {
        return vec4f(u_material.xyz, u_material.w);
    }

    // *** TODO_A1_DONE : Task 4-4 (4 points)
    // Use uniform color u_material.xyz and vertex noise noiseColor to create your shading.
    // Keep alpha set to u_material.w.
    // Describe the rationale of your implementation in the documentation section.
    
    // --- begin code ---
    // Minimal default so runtime stays stable until task code is implemented.
    //return vec4f(u_material.xyz, u_material.w);

    var color_x: f32;
    color_x = u_material.x*noiseColor.z;

    var color_y: f32;
    color_y = u_material.y*noiseColor.x;

    var color_z: f32;
    color_z = u_material.z*noiseColor.y*2;

    // The * operator is overloaded to perform Scalar multipication on vec types. But I figured I'd customize each a little bit to see if I could get it to look better
    return vec4f( color_x, color_y, color_z, u_material.w);
    // --- end code ---
}
