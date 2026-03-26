// Copyright (c) 2019-2026 Przemyslaw Musialski
"use strict"

// ============================================================================
// Student Metadata
// ============================================================================
function studentdata() {

    //*** TODO_A1_DONE : init the const variables below with your credentials ***
    const lastname = 'Blake';
    const firstname = 'Joyce-Sofia (Jia)';
    const studentnum = '31585309';

    // don't change the lines below!
    document.getElementById("author").innerText = ("Author: ").concat(lastname, ", ", firstname, ", ", studentnum);
    document.getElementById("title").innerText = ("A1 | ").concat(lastname, ", ", firstname, ", ", studentnum);
}


// ============================================================================
// Geometry Source: Procedural UV Sphere
// ============================================================================
// Generates a unit sphere geometry for a given number of segments. 
// The function uses spherical coordinates (https://en.wikipedia.org/wiki/Spherical_coordinate_system)
// with radius = 1 and y-axis as the up-axis. 

// Based on the so-called "ISO convention" of angles, as shown on the Wikipedia page,  Phi  is essentially our Up-Down controller. While Theta, 0, determines Left-Right
// Meaning the heightSegments is how many fractions of Phi (Up/Down) You will have,  with the 1st (Top) and last (Bottom) being purely triangles.
// and widthSegments being for Theta (Left-Right)
function sphereGeometry(heightSegments = 12, widthSegments = 24, radius = 1.0) {
    // *** TODO_A1 : Task 4-1 (8 points)
    // Implement the procedural UV sphere generation in this function.
    // Required:
    // - Generate vertex positions for a UV sphere using spherical coordinates.
    // - Build triangle indices that connect the UV grid into two triangles per quad.
    // - Keep the output format:
    //   vertices = [x, y, z, r, g, b, ...], indices = [i0, i1, i2, ...]   //Where the indices are numbers
    // References:
    // - https://en.wikipedia.org/wiki/UV_mapping
    // - https://en.wikipedia.org/wiki/Spherical_coordinate_system
    
    // --- begin code ---
    // code here

    //Compute the vertices
    var vertices = [];
    //Add the top vertex
    //vertices.push( vec3(0, radius, 0) );

    for (var i = 0; i <= heightSegments; i++) {
        //var phi1 = (i/heightSegments)*Math.PI;  // or I could just do one phi  :o
        //var phi2 = ((i+1)/heightSegments)*Math.PI;
        var lat = ((i)/heightSegments)*Math.PI;

        for(var j = 0; j <= widthSegments; j++){
            // Designate which Theta angles ("points" 1 and 2) to use to draw each triangle
            //var theta1 = (j/widthSegments)*2*Math.PI;   // Where this number should span across the entire circumference
            //var theta2 = ((j+1)/widthSegments)*2*Math.PI;
            var long = (j/widthSegments)*2*Math.PI;

            // Calculate the vertices you're going to use for these triangles here
            let x = Math.sin(lat) * Math.cos(long);
            let y = Math.cos(lat); //because Y is the up axis
            let z = Math.sin(lat) * Math.sin(long);

            let vec = vec3(x,y,z);
            //Scale the vertex by the radius just in case the radius is not 1.
            scale(radius, vec);

            vertices.push(vec);

            /* //Index part belongs in a different loop
            // And also figure out the INDEX positions for each of these triangles whose vertecies you're making
            //Top
            if(i == 0) {
                //Make a triangle using  vertex1, 3 and 4
                indices.push[ vertices[], vertices[], vertices[] ]
            }
            //Bottom
            else if(i+1 == heightSegments) {
                //Make a triangle
            }
            else {
                //make MORE trianlges !  Which woudl normally be represented as quads
            }
            */
        }
    }
    //Add the bottom vertex
    //let negative_radius = radius*-1;
    //vertices.push( vec3(0, negative_radius, 0) );

    // The indices array contains the INDEX (the literal number).  That will be used to index INTO the vertex array.
    // ==== notes
    /*     0 1 2 3 4 5   6 7 ...
        //[x,y,z,r,g,b   x,y,z]
    i0 = 0; // V0
    i1 = 6; // V1 ; Or you could try 1,  'cause it might already take it into account
    i2 = vertices[12];
    */
    // ========

    var indices = [];
    /*
    //For the top row -- conected to the Top vertex
    for (var k = 0; k < widthSegments; ++k){
        //  [0,1,2] [0,2,3] [0,3,4] ... [0, widthSegments, 1]
        let i0 = k+1;  //next vertex -- should include the value of widthSegments
        let i1 = (k+2) % widthSegments + 1; //next vertex (modulo so it wraps arounds back to index 1)
        indices.push( 0, i0, i1 );

    //For the bottom row
        //  [last,last-1,last-2] [0,2,3] [0,3,4]
        i0 = k + widthSegments*(heightSegments-2) + 1;  //Down one column (One level of Latitude)
        i1 = (k+2) % widthSegments + widthSegments*(heightSegments-2) + 1;
        indices.push( i0, i1, (vertices.length-1) );        
    }
    */

    for (var i = 0; i < heightSegments; i++) {
        var k1 = i * (widthSegments+1);
        var k2 = k1 + widthSegments+1;
        for(var j = 0; j < widthSegments; j++){
            
            if(i!=0) {
                indices.push(k1);
                indices.push(k2);
                indices.push(k1+1);
            }

            if(i != (heightSegments - 1) ) {
                indices.push(k1+1);
                indices.push(k2);
                indices.push(k2+1);
            }
            k1++;
            k2++;
        }
    }

    return { vertices: [], indices: [] };
    // --- end code ---
}

// ============================================================================
// Geometry Source: OBJ Parsing/Loading Fallback
// ============================================================================
// Parse a triangle OBJ mesh into the assignment interleaved format:
// [pos.x, pos.y, pos.z, col.r, col.g, col.b] with shared grayscale noise color.
function objGeometry(objText, radius = 1.0) {

    noise.seed(Math.random());

    let positions = [];
    let indices = [];
    let lines = objText.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.length === 0 || line[0] === "#") {
            continue;
        }

        let parts = line.split(/\s+/);
        if (parts[0] === "v" && parts.length >= 4) {
            positions.push([
                radius * Number(parts[1]),
                radius * Number(parts[2]),
                radius * Number(parts[3])
            ]);
        }
        else if (parts[0] === "f" && parts.length >= 4) {
            // Support triangle and polygon faces by fan triangulation.
            let face = [];
            for (let k = 1; k < parts.length; k++) {
                let token = parts[k];
                if (!token) {
                    continue;
                }
                let ref = token.split("/")[0];
                let vidx = Number(ref);
                if (!Number.isFinite(vidx) || vidx === 0) {
                    continue;
                }
                if (vidx < 0) {
                    vidx = positions.length + vidx + 1;
                }
                face.push(vidx - 1);
            }

            for (let t = 1; t + 1 < face.length; t++) {
                indices.push(face[0], face[t], face[t + 1]);
            }
        }
    }

    if (positions.length === 0 || indices.length === 0) {
        throw new Error("OBJ parser: no vertices or faces found.");
    }

    let vertices = [];
    for (let i = 0; i < positions.length; i++) {
        let x = positions[i][0];
        let y = positions[i][1];
        let z = positions[i][2];
        let c = (1 + noise.simplex3(2 * x, 2 * y, 2 * z)) / 2;
        vertices.push(x, y, z, c, c, c);
    }

    return { vertices, indices };
}

// ----------------------------------------------------------------------------
// Load an OBJ mesh from disk and convert it to the assignment geometry format.
async function loadOBJGeometry(url) {
    let response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error("Failed to load OBJ: " + url + " (" + response.status + ")");
    }
    let objText = await response.text();
    return objGeometry(objText, 1.0);
}



// ============================================================================
// Task 4 Runtime (WebGPU-only)
// ============================================================================
// Main function of the Task14 runtime.
// This task runs as WebGPU-only.
async function main()
{

    // ------------------------------------------------------------------------
    // Section A: Student Data + Runtime Handles
    // ------------------------------------------------------------------------
    // Update HTML with student data.
    studentdata();

    // WebGPU runtime handles + controls.
    var webgpuPreviewCanvas = document.getElementById("webgpuCanvas");
    var webgpuStatus = document.getElementById("webgpuStatus");
    var task14PreviewGeneration = 0;
    var task14PreviewHandle = null;
    var task41FallbackGeometry = null;

    // ------------------------------------------------------------------------
    // Section B: Geometry Fallback Loader
    // ------------------------------------------------------------------------
    async function loadTask41FallbackGeometry() {
        try {
            task41FallbackGeometry = await loadOBJGeometry("./resources/sphere_uv_fallback.obj");
            console.log("Task 4-1 fallback active: loaded OBJ sphere from resources.");
        } catch (error) {
            console.warn("Task 4-1 fallback OBJ load failed:", error);
            task41FallbackGeometry = null;
        }
    }

    // ------------------------------------------------------------------------
    // Section C: Preview Sync Helpers
    // ------------------------------------------------------------------------
    function syncTask14PreviewVisibility() {
        if (task14PreviewHandle && typeof task14PreviewHandle.setVisibility === "function") {
            task14PreviewHandle.setVisibility(
                document.getElementById("drawSun").checked,
                document.getElementById("drawEarth").checked,
                document.getElementById("drawMoon").checked
            );
        }
    }

    function setTask14PreviewAliases(handle) {
        window.A1_WEBGPU_TASK14 = handle;
    }

    function syncTask14PreviewState(handle) {
        if (!handle) {
            return;
        }

        var speedSlider = document.getElementById("rangeSlider");
        var rotXSlider = document.getElementById("rotXSlider");
        var rotYSlider = document.getElementById("rotYSlider");
        var rotZSlider = document.getElementById("rotZSlider");
        var drawSunCheck = document.getElementById("drawSun");
        var drawEarthCheck = document.getElementById("drawEarth");
        var drawMoonCheck = document.getElementById("drawMoon");
        var drawWireCheck = document.getElementById("drawWire");
        var depthCheck = document.getElementById("depthCheck");
        var cullSelect = document.getElementById("cullface");
        var frontFaceSelect = document.getElementById("frontface");

        if (typeof handle.setSpeed === "function" && speedSlider) {
            handle.setSpeed(Number(speedSlider.value));
        }
        if (typeof handle.setViewEuler === "function") {
            handle.setViewEuler(
                rotXSlider ? Number(rotXSlider.value) : 0,
                rotYSlider ? Number(rotYSlider.value) : 0,
                rotZSlider ? Number(rotZSlider.value) : 0
            );
        }
        if (typeof handle.setVisibility === "function") {
            handle.setVisibility(
                drawSunCheck ? drawSunCheck.checked : true,
                drawEarthCheck ? drawEarthCheck.checked : true,
                drawMoonCheck ? drawMoonCheck.checked : true
            );
        }
        if (typeof handle.setDepthTest === "function" && depthCheck) {
            handle.setDepthTest(depthCheck.checked);
        }
        if (typeof handle.setCullMode === "function" && cullSelect) {
            handle.setCullMode(cullSelect.value);
        }
        if (typeof handle.setFrontFace === "function" && frontFaceSelect) {
            handle.setFrontFace(frontFaceSelect.value);
        }
        if (typeof handle.setWireframe === "function" && drawWireCheck) {
            handle.setWireframe(drawWireCheck.checked);
        }
    }

    // ------------------------------------------------------------------------
    // Section D: Preview Lifecycle (Create/Restart)
    // ------------------------------------------------------------------------
    async function startTask14Preview() {
        task14PreviewGeneration += 1;
        var generation = task14PreviewGeneration;

        if (task14PreviewHandle && typeof task14PreviewHandle.destroy === "function") {
            task14PreviewHandle.destroy();
        }
        task14PreviewHandle = null;
        setTask14PreviewAliases(null);

        if (!("gpu" in navigator)) {
            a1WgpuSetStatus(webgpuStatus, "WebGPU Task 4: navigator.gpu unavailable.", "err");
            return;
        }

        if (typeof runTask14WebGPUPreview !== "function") {
            a1WgpuSetStatus(webgpuStatus, "WebGPU Task 4: preview renderer is missing.", "err");
            return;
        }

        try {
            var result = await runTask14WebGPUPreview(webgpuPreviewCanvas, webgpuStatus, {
                isActive: function () {
                    return generation === task14PreviewGeneration;
                },
                fallbackGeometry: task41FallbackGeometry
            });

            if (generation !== task14PreviewGeneration) {
                if (result && typeof result.destroy === "function") {
                    result.destroy();
                }
                return;
            }

            task14PreviewHandle = result;
            setTask14PreviewAliases(result);
            syncTask14PreviewState(result);
        } catch (error) {
            console.error("WebGPU Task 4 startup failed:", error);
        }
    }

    await loadTask41FallbackGeometry();
    await startTask14Preview();

    // ------------------------------------------------------------------------
    // Section E: UI Event Wiring (WebGPU Controls)
    // ------------------------------------------------------------------------
    document.getElementById("rangeSlider").oninput = function (event) {
        if (task14PreviewHandle && typeof task14PreviewHandle.setSpeed === "function") {
            task14PreviewHandle.setSpeed(Number(event.target.value));
        }
    };

    function syncViewEulerFromUI() {
        if (task14PreviewHandle && typeof task14PreviewHandle.setViewEuler === "function") {
            task14PreviewHandle.setViewEuler(
                Number(document.getElementById("rotXSlider").value),
                Number(document.getElementById("rotYSlider").value),
                Number(document.getElementById("rotZSlider").value)
            );
        }
    }

    document.getElementById("rotXSlider").oninput = syncViewEulerFromUI;
    document.getElementById("rotYSlider").oninput = syncViewEulerFromUI;
    document.getElementById("rotZSlider").oninput = syncViewEulerFromUI;

    document.getElementById("depthCheck").onchange = function () {
        if (task14PreviewHandle && typeof task14PreviewHandle.setDepthTest === "function") {
            task14PreviewHandle.setDepthTest(this.checked);
        }
    };

    document.getElementById("drawSun").onchange = function () {
        syncTask14PreviewVisibility();
    };
    document.getElementById("drawEarth").onchange = function () {
        syncTask14PreviewVisibility();
    };
    document.getElementById("drawMoon").onchange = function () {
        syncTask14PreviewVisibility();
    };

    document.getElementById("drawWire").onchange = function () {
        if (task14PreviewHandle && typeof task14PreviewHandle.setWireframe === "function") {
            task14PreviewHandle.setWireframe(this.checked);
        }
    };

    document.getElementById("cullface").onchange = function (event) {
        if (task14PreviewHandle && typeof task14PreviewHandle.setCullMode === "function") {
            task14PreviewHandle.setCullMode(event.target.value);
        }
    };

    document.getElementById("frontface").onchange = function (event) {
        if (task14PreviewHandle && typeof task14PreviewHandle.setFrontFace === "function") {
            task14PreviewHandle.setFrontFace(event.target.value);
        }
    };

}
