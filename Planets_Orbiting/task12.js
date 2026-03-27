"use strict"

var a1Task12WgslSourcePromise = null;
function a1LoadTask12WgslSource() {
    if (!a1Task12WgslSourcePromise) {
        a1Task12WgslSourcePromise = fetch("./resources/webgpu-task12.wgsl", { cache: "no-store" })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Unable to load ./resources/webgpu-task12.wgsl (" + response.status + ")");
                }
                return response.text();
            })
            .catch(function (error) {
                a1Task12WgslSourcePromise = null;
                throw error;
            });
    }
    return a1Task12WgslSourcePromise;
}

// ----------------------------------------------------------------------------
//*** TODO_A1_DONE : Insert your credentials below ***
var lastname = 'Last Name';
var firstname = 'First Name';
var studentnum = 'StudentID';
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// Minimal WebGPU helpers inlined for Task 2 (DL.v6).
function a1WgpuSetStatus(statusElem, message, level) {
    if (!statusElem) {
        return;
    }
    statusElem.textContent = message;
    statusElem.className = "statusline";
    if (level === "ok") {
        statusElem.classList.add("ok");
    } else if (level === "warn") {
        statusElem.classList.add("warn");
    } else if (level === "err") {
        statusElem.classList.add("err");
    }
}

function a1WgpuClamp01(value) {
    return Math.max(0.0, Math.min(1.0, Number(value)));
}

function a1WgpuToFloat32Array(data) {
    if (data instanceof Float32Array) {
        return data;
    }
    return new Float32Array(data);
}

function a1WgpuCreateUniformBuffer(device, label, initialData) {
    var data = a1WgpuToFloat32Array(initialData);
    var buffer = device.createBuffer({
        label: label,
        size: data.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(buffer, 0, data);
    return {
        buffer: buffer,
        data: data
    };
}

function a1WgpuBlendTarget(format) {
    return {
        format: format,
        blend: {
            color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
            },
            alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
            }
        }
    };
}

async function a1WgpuInitCanvasContext(canvas, statusElem, labelPrefix) {
    if (!canvas) {
        a1WgpuSetStatus(statusElem, labelPrefix + ": preview canvas element not found.", "err");
        return null;
    }

    if (!("gpu" in navigator)) {
        a1WgpuSetStatus(statusElem, labelPrefix + ": navigator.gpu is not available in this browser.", "warn");
        return null;
    }

    try {
        a1WgpuSetStatus(statusElem, labelPrefix + ": requesting adapter/device...", "warn");

        var adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            a1WgpuSetStatus(statusElem, labelPrefix + ": adapter request returned null.", "err");
            return null;
        }

        var device = await adapter.requestDevice();
        var context = canvas.getContext("webgpu");
        if (!context) {
            a1WgpuSetStatus(statusElem, labelPrefix + ": failed to acquire webgpu context from preview canvas.", "err");
            return null;
        }

        var format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device: device,
            format: format,
            alphaMode: "premultiplied"
        });

        var adapterName = (adapter.info && adapter.info.description)
            ? adapter.info.description
            : "Unknown Adapter";
        console.log("[" + labelPrefix + "] Adapter:", adapterName);
        console.log("[" + labelPrefix + "] Canvas Format:", format);
        console.log("[" + labelPrefix + "] Device acquired.");

        return {
            adapter: adapter,
            device: device,
            context: context,
            format: format
        };
    } catch (error) {
        a1WgpuSetStatus(statusElem, labelPrefix + " failed: " + error.message, "err");
        return null;
    }
}


// ----------------------------------------------------------------------------
function createCircleGeometry(radius, segments) {
    var points = [];
    var colors = [];
    
    // *** TODO_A1 : Task 2a
    // Create a circle geometry which can be rendered using a TRIANGLE_FAN.   JNote: a Triangle_Fan insinuates that one of the triangle's vertices IS the center of your shape
    // Use the arguments of the function to specify the radius of the circle 
    // and the number of linear segments to approximate it. 
    //
    // Interpolate the color values on the circle linearly using the HUE of
    // the HSV color-space (function hsvToRgb(.,.,.)). 



    // As for the line,  he said it was pretty much just:  NOT connecting it back to the center.

    // --- begin code ---
    console.log(segments);
    //segments is the number of lines (of the entire shape). So, for example, the lowest # of 3. Meaning we have a Triangle at LEAST
    
    //Define the origin point (Since we need to use it to connect each subsequent triangle back to the center anyway)
    var origin = vec2(0.0, 0.0);
    points.push(origin);

    var centerColor = vec3(1.0,1.0,1.0);  //Make the center white
    colors.push( centerColor );
    
    //initialize the variable 'vertex' (and the 2nd one)
    var vertex = vec2(0.0, 0.0);
    var vertex_2 = vec2(0.0, 0.0);
    for(var i = 0; i < segments; i++){
        // for each point,  push the current point on the outside of the circle,  then the next one, AND the center point (+ color)
        let x = (radius * Math.cos(i *2*Math.PI/segments)); // Where i * 2Pi/segments is the angle (alpha) for that particular segment
        let y = (radius * Math.sin(i *2*Math.PI/segments));
        //console.log("X:",x,"Y:",y);
        vertex = vec2( x, y );
        //Push the point
        points.push( vertex );
        //ALSO push The next one
        let next_x = (radius * Math.cos( (i+1) *2*Math.PI/segments));
        let next_y = (radius * Math.sin( (i+1) *2*Math.PI/segments));
        vertex_2 = vec2(next_x, next_y);
        points.push(vertex_2);
        //AND THEN the origin again :D   3 points makes a triangle :)
        points.push(origin);

        // Hue = i/segments. Saturation & value would be full.

        colors.push(hsvToRgb( i / segments,1.0,1.0));
        colors.push(hsvToRgb( (i+1) / segments,1.0,1.0));
        colors.push( centerColor ); //To match the length of the Points array
    }
    // --- end code ---

    return flattenArrays(points, colors);
}


// ----------------------------------------------------------------------------
// Task 2 WebGPU renderer (flattened into task12.js for DL.v4).
// *** TODO_A1 : Task 2b
// Adapt the rendering pipeline to draw:
// - the filled circle (triangle fan), and
// - a black circle outline (line strip) from the same geometry.
// In this light WebGPU build, implement this in:
//   createTask12WebGPURenderer(...) below.
//
// *** TODO_A1 : Task 2c
// Explain in the documentation why the displayed circle appears non-round
// when shown in a non-square viewport.   --- JNote: If i had to guess it's because the way the Viewport works is that it stretches the coordinates out, so it gets stretched into an oval while it's in a rectangle
async function createTask12WebGPURenderer(canvas, statusElem) {
    var statusPrefix = "WebGPU Task 2";

    try {
        var init = await a1WgpuInitCanvasContext(canvas, statusElem, statusPrefix);
        if (!init) {
            return null;
        }

        var device = init.device;
        var context = init.context;
        var format = init.format;

        var uniformData = a1WgpuCreateUniformBuffer(
            device,
            "A1-Task12-UniformBuffer",
            [1.0, 0.0, 0.0, 0.0]
        );
        var params = uniformData.data;
        var uniformBuffer = uniformData.buffer;

        var shaderSource = null;
        try {
            shaderSource = await a1LoadTask12WgslSource();
        } catch (wgslLoadError) {
            a1WgpuSetStatus(statusElem, "WebGPU Task 2 shader load failed: " + wgslLoadError.message, "err");
            console.error("[WebGPU Task 2] WGSL load failed:", wgslLoadError);
            return null;
        }
        var shaderModule = device.createShaderModule({
            label: "A1-Task12-ShaderModule",
            code: shaderSource
        });
        if (typeof shaderModule.getCompilationInfo === "function") {
            var compilationInfo = await shaderModule.getCompilationInfo();
            var compileErrors = compilationInfo.messages.filter(function (msg) {
                return msg.type === "error";
            });
            if (compileErrors.length > 0) {
                var firstError = compileErrors[0] && compileErrors[0].message
                    ? compileErrors[0].message
                    : "Unknown WGSL compilation error.";
                a1WgpuSetStatus(statusElem, "WebGPU Task 2 shader compile failed: " + firstError, "err");
                console.error("[WebGPU Task 2] WGSL compile errors:", compileErrors);
                return null;
            }
        }

        var bindGroupLayout = device.createBindGroupLayout({
            label: "A1-Task12-BindGroupLayout",
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" }
            }]
        });

        var pipelineLayout = device.createPipelineLayout({
            label: "A1-Task12-PipelineLayout",
            bindGroupLayouts: [bindGroupLayout]
        });

        var fillPipeline = device.createRenderPipeline({
            label: "A1-Task12-FillPipeline",
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [{
                    arrayStride: 5 * Float32Array.BYTES_PER_ELEMENT,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: "float32x2"
                        },
                        {
                            shaderLocation: 1,
                            offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                            format: "float32x3"
                        }
                    ]
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [a1WgpuBlendTarget(format)]
            },
            primitive: {
                topology: "triangle-list"
            }
        });
        // =========================================
        var outlinePipeline = device.createRenderPipeline({
            label: "A1-Task12-JBOutlinePipeline",
            layout: pipelineLayout, //same layout
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [{
                    arrayStride: 5 * Float32Array.BYTES_PER_ELEMENT,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: "float32x2"
                        },
                        {
                            shaderLocation: 1,
                            offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                            format: "float32x3"
                        }
                    ]
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [a1WgpuBlendTarget(format)]
            },
            primitive: {
                topology: "line-strip" //different topology - "Each vertex after the first defines a Line between it & the previous vertex"
            }
        });

        // =========================================
        var bindGroup = device.createBindGroup({
            label: "A1-Task12-BindGroup",
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer }
            }]
        });

        var fillBuffer = null;
        var fillVertexCount = 0;
        var fillEnabled = true;
        var disposed = false;
        //JB Start:
        var outlineBuffer = null;
        var outlineVertexCount = 0;

        function renderFrame() {
            if (disposed) {
                return;
            }

            var encoder = device.createCommandEncoder({ label: "A1-Task12-Encoder" });
            var pass = encoder.beginRenderPass({
                colorAttachments: [{
                    view: context.getCurrentTexture().createView(),
                    clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
                    loadOp: "clear",
                    storeOp: "store"
                }]
            });

            //JNote: regardless if fill is enabled
            if(outlineBuffer && outlineVertexCount) {
                pass.setPipeline(outlinePipeline);
                pass.setBindGroup(0, bindGroup);
                pass.setVertexBuffer(0, fillBuffer); //I know it shouldn't be the fillBuffer... because that data has Colors (and extra vertices leading back to the circle's origin) in it
                pass.draw(fillVertexCount, 1, 0, 0); //^Same with vertex count... Technically an outline shouldn't use the exact same number of vertices as the filled circle BUT IDK HOW TO CHANGE IT :((
            }

            if (fillEnabled && fillBuffer && fillVertexCount > 0) {
                pass.setPipeline(fillPipeline);
                pass.setBindGroup(0, bindGroup);
                pass.setVertexBuffer(0, fillBuffer);
                pass.draw(fillVertexCount, 1, 0, 0);
            }

            pass.end();
            device.queue.submit([encoder.finish()]);
        }

        function setGeometry(interleavedArray) {
            if (disposed || !interleavedArray || interleavedArray.length === 0) {
                return;
            }

            var fillVerts = a1WgpuToFloat32Array(interleavedArray);
            if (fillVerts.length % 5 !== 0) {
                a1WgpuSetStatus(statusElem, "WebGPU Task 2: geometry update ignored (stride mismatch).", "err");
                return;
            }
            if (fillVerts.length < 15) {
                return;
            }

            if (fillBuffer) {
                fillBuffer.destroy();
            }

            fillBuffer = device.createBuffer({
                label: "A1-Task12-FillVertexBuffer",
                size: fillVerts.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            device.queue.writeBuffer(fillBuffer, 0, fillVerts);

            fillVertexCount = fillVerts.length / 5;

            //JB Start:  Outline
            var outlineVerts = a1WgpuToFloat32Array(interleavedArray);
            // How do I make it black while I'm in this function :((

            if (outlineVerts.length % 5 !== 0) {
                a1WgpuSetStatus(statusElem, "WebGPU Task 2: geometry update ignored (stride mismatch).", "err");
                return;
            }
            if (outlineVerts.length < 15) {
                return;
            }
            
            if (outlineBuffer) {
                outlineBuffer.destroy();
            }

            outlineBuffer = device.createBuffer({
                label: "A1-Task12-JBOutlineVertexBuffer",
                size: outlineVerts.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            });
            device.queue.writeBuffer(outlineBuffer, 0, outlineVerts);

            outlineVertexCount = outlineVerts.length / 5;
            renderFrame();
        }

        function setAlpha(alpha) {
            if (disposed) {
                return;
            }
            params[0] = a1WgpuClamp01(alpha);
            device.queue.writeBuffer(uniformBuffer, 0, params);
            renderFrame();
        }

        function setFillEnabled(enabled) {
            if (disposed) {
                return;
            }
            fillEnabled = !!enabled;
            renderFrame();
        }

        function destroyRenderer() {
            if (disposed) {
                return;
            }
            disposed = true;
            if (fillBuffer) {
                fillBuffer.destroy();
                fillBuffer = null;
            }
        }

        a1WgpuSetStatus(statusElem, "WebGPU Task 2 baseline ready: geometry and alpha controls are active.", "ok");
        return {
            setGeometry: setGeometry,
            setAlpha: setAlpha,
            setFillEnabled: setFillEnabled,
            destroy: destroyRenderer
        };
    } catch (error) {
        a1WgpuSetStatus(statusElem, "WebGPU Task 2 failed: " + error.message, "err");
        return null;
    }
}


// ----------------------------------------------------------------------------
// Main function of the Task12 runtime.
// This task runs as WebGPU-only.
// It contains further functions as nested functions used for rendering.
// This avoids the usage of global variables: all variables can be 
// defined in the main function. 
function main() {
    // ----------------------------------------------------------------------------
    // Task12 runs as WebGPU-only.
    var segments = Number(document.getElementById("rangeSlider").value);
    var alpha = Number(document.getElementById("alphaSlider").value);
    var fillEnabled = document.getElementById("drawCheck").checked;
    var geometry = createCircleGeometry(0.7, segments);

    var webgpuPreviewCanvas = document.getElementById("webgpuCanvas");
    var webgpuStatus = document.getElementById("webgpuStatus");
    var task12Renderer = null;

    async function startTask12Renderer() {

        if (!("gpu" in navigator)) {
            a1WgpuSetStatus(webgpuStatus, "WebGPU Task 2: navigator.gpu unavailable.", "err");
            return;
        }

        if (task12Renderer && typeof task12Renderer.destroy === "function") {
            task12Renderer.destroy();
        }
        task12Renderer = null;

        task12Renderer = await createTask12WebGPURenderer(webgpuPreviewCanvas, webgpuStatus);
        if (!task12Renderer) {
            return;
        }

        task12Renderer.setGeometry(geometry);
        task12Renderer.setAlpha(alpha);
        task12Renderer.setFillEnabled(fillEnabled);
    }
    startTask12Renderer().catch(function (error) {
        console.error("WebGPU Task 2 startup failed:", error);
    });


    // ----------------------------------------------------------------------------
    // Register the event for update of segments with the UI slider.
    document.getElementById("rangeSlider").onchange = function (event) {
        segments = Number(event.target.value);
        geometry = createCircleGeometry(0.7, segments);

        // Keep WebGPU geometry in sync with the same control.
        if (task12Renderer) {
            task12Renderer.setGeometry(geometry);
        }
    }

    // Register the event for update of alpha with the UI slider.
    document.getElementById("alphaSlider").onchange = function (event) {
        alpha = Number(event.target.value);

        // Keep WebGPU preview alpha synchronized with the same control.
        if (task12Renderer) {
            task12Renderer.setAlpha(alpha);
        }
    }

    // Register event for fill-toggle in WebGPU.
    document.getElementById("drawCheck").onchange = function (event) {
        fillEnabled = event.target.checked;
        if (task12Renderer) {
            task12Renderer.setFillEnabled(fillEnabled);
        }
    }
}
