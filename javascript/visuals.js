"use strict";

var VISUALS = (function() {

    var visuals = {};

    visuals.init = function() {

        //local vars
        var width    = elem.select("output-view-container").offsetWidth,
            height   = elem.select("output-view-container").offsetHeight,

            renderer = new THREE.WebGLRenderer({antialias: false, alpha: true}),
            scene    = new THREE.Scene(),
            light    = new THREE.AmbientLight(0xffffff),

            VFOVdeg  = 45,
            aspect   = width/height,
            near     = 0.1,
            far      = 10,
            camera   = new THREE.PerspectiveCamera(VFOVdeg, aspect, near, far),

            mouse    = {x: null, y: null},

            //aspect ratio is 2.5 : 1
            w        = 1,
            h        = 0.4,
            r        = h/(2*Math.tan((VFOVdeg*Math.PI/180)/2)),

            scalar   = 0.925,
            numH     = 25,
            numV     = 7,

            canvasW  = Math.floor(width*(1-(1.01)*scalar)),
            canvasH  = Math.floor(height*(0.6)*scalar/(numH-1)),

            lines    = { xaxis: {tick: {}, ext: {}, dots: {}}, yaxis: {} },
            labels   = { xaxis: {canvas: {}, context: {}, texture: {}, mesh: {}}, yaxis: {canvas: {}, context: {}, texture: {}, mesh: {}} },
            tracker,
            trackerLine,
            trackerContext,
            trackerTexture,
            trackerMesh,

            dataArr  = [g.PROFITLOSS_DATA, g.DELTA_DATA, g.GAMMA_DATA, g.THETA_DATA, g.VEGA_DATA, g.RHO_DATA, g.VOMMA_DATA, g.CHARM_DATA, g.VETA_DATA],
            dataVal,
            timeArr  = [obj.min(g.EXPIRY), obj.min(g.EXPIRY)-0.5, 0],
            range    = [],
            cloud    = {};

        // SUPPORT FUNCTIONS ========================================================================================================================

        //push vertices to point cloud geometry
        var pushVertices = function(oArr, tIdx, dVal) {

            for(var datum in oArr) {

                cloud[dVal][tIdx].geometry.vertices.push(new THREE.Vector3(

                    //x-coordinate
                    w*(scalar*(Object.keys(oArr).indexOf(datum)/(obj.size(oArr)-1)-1)+0.5),

                    //y-coordinate
                    h/2*(scalar*(oArr[datum]/range[dVal]-numH/(numH-1))+1),

                    //z-coordinate
                    0.00001
                ));
            }
        }


        var addGraphComponents = function() {

            //axis label canvas, context, etc.
            var addAxisLabelCanvas = function(axis, n) {

                var p = axis == 'yaxis' ? 1 : 0.75;

                //create the canvas
                labels[axis].canvas[n]        = document.createElement('canvas');
                labels[axis].canvas[n].width  = canvasW*p;
                labels[axis].canvas[n].height = canvasH;

                //get context, paint the canvas background
                labels[axis].context[n]           = labels[axis].canvas[n].getContext('2d');
                labels[axis].context[n].fillStyle = '#888888';
                labels[axis].context[n].fillRect(0, 0, canvasW*p, canvasH);

                //set color, font and alignment for the text
                labels[axis].context[n].fillStyle    = 'black';
                labels[axis].context[n].font         = (canvasH-1)+'px Arial';
                labels[axis].context[n].textAlign    = 'center';
                labels[axis].context[n].textBaseline = 'middle';
            }


            //axis label texture, mesh, etc.
            var addAxisLabelMesh = function(axis, n) {

                var p = axis == 'yaxis' ? 1 : 0.75;

                //set canvas as texture and specify texture property values
                labels[axis].texture[n]             = new THREE.Texture(labels[axis].canvas[n]);
                labels[axis].texture[n].minFilter   = THREE.LinearFilter;
                labels[axis].texture[n].needsUpdate = true;

                //create label mesh and map canvas texture to it
                labels[axis].mesh[n] = new THREE.Mesh( 
                                           new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*p, h*(0.6)*scalar/(numH-1), 1, 1),
                                           new THREE.MeshBasicMaterial({map: labels[axis].texture[n]})
                                       );
            }


            //find the standard deviation distance in terms of the vertical gridline indicies
            var sDD = function(idx) {

                //local var
                var d;

                switch((g.STOCKRANGE_LENGTH-1) % (numV-1)) {

                    case 0:
                        d = (g.STOCKRANGE_LENGTH-1)/(numV-1)*idx;
                        break;

                    default:
                        switch(Math.floor((g.STOCKRANGE_LENGTH-1)/(numV-1))) {

                            //the case where the fractional part of the remainder is < 0.5; thanks to Michael Wunder for his help with this
                            case Math.round((g.STOCKRANGE_LENGTH-1)/(numV-1)):
                                d = Math.floor((g.STOCKRANGE_LENGTH-1)/(numV-1))*idx+Math.floor((idx+1)/3);
                                break;

                            //the case where the fractional part of the remainder is >= 0.5
                            default:
                                d = Math.ceil((g.STOCKRANGE_LENGTH-1)/(numV-1))*idx-Math.floor((idx+1)/3);
                                break;
                        }
                        break;
                }

                return d;
            }


            //add dotted line
            var addDots = function(idx, syz, col) {

                lines.xaxis.dots[idx] = new THREE.Points(
                                            new THREE.Geometry(),
                                            new THREE.PointsMaterial({size: syz, color: col})
                                        );

                //add vertices to the dotted line geometry
                for(var j=0; j<(4*numH-6); j++) {

                    lines.xaxis.dots[idx].geometry.vertices.push(new THREE.Vector3(
                        w*(scalar*(sDD(idx)/(g.STOCKRANGE_LENGTH-1)-1)+0.5),
                        h*(scalar*(0.25*(j+1)/(numH-1)-1)+0.5),
                        0
                    ));
                }
            }


            //extend left or right-most tick mark on the graph
            var extendTick = function(idx) {

                var x = {  0: { left:   w*(-scalar+0.50),
                                center: w*0.25*(-scalar*(1.01*0.75+4)+0.75+2),
                                right:  w*0.50*(-scalar*(1.01*0.75+2)+0.75+1) },

                           6: { left:   w*0.50*(0.75*(scalar*1.01-1)+1),
                                center: w*0.25*(0.75*(scalar*1.01-1)+2),
                                right:  w*0.50 }  },

                extGeom = new THREE.Geometry();

                //left vertex
                extGeom.vertices.push(new THREE.Vector3(
                    x[idx].left,
                    h/2*(1-scalar*(2*numH)/(numH-1)),
                    0
                ));

                //center vertex
                extGeom.vertices.push(new THREE.Vector3(
                    x[idx].center,
                    h/2*(1-scalar*(2*numH)/(numH-1)),
                    0
                ));

                //right vertex
                extGeom.vertices.push(new THREE.Vector3(
                    x[idx].right,
                    h/2*(1-scalar*(2*numH)/(numH-1)),
                    0
                ));

                lines.xaxis.ext[idx] = new THREE.Line(
                                           extGeom,
                                           new THREE.LineBasicMaterial({color: 0xffff00})
                                       );

                //add tick mark extension to the scene
                scene.add(lines.xaxis.ext[idx]); 
            }


            var addBackground = (function() {

                //the background
                var plane1 = new THREE.Mesh(
                                 new THREE.PlaneGeometry(w, h, 1, 1),
                                 new THREE.MeshBasicMaterial({color: 0x888888})
                             ),

                    plane2 = new THREE.Mesh(
                                 new THREE.PlaneGeometry(w*scalar, h*scalar, 1, 1),
                                 new THREE.MeshBasicMaterial({color: 0x333333})
                             );

                //set background position and add it to the scene
                plane1.position.set(0, 0, 0);
                plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numH/(numH-1)), 0);

                scene.add(plane1, plane2);
            }());


            var addYAxisComponents = (function() {

                //add horizontal gridlines and vertical axis labels
                for(var i=0; i<numH; i++) {

                    //gridline geometry
                    var gridlineGeom = new THREE.Geometry();

                    //left vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(
                        w/2*(1-(1.01)*scalar*2),
                        h/2*(1-scalar*(2*i+1)/(numH-1)),
                        0
                    ));

                    //center vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(
                        w/2*(1-(1.01)*scalar),
                        h/2*(1-scalar*(2*i+1)/(numH-1)),
                        0
                    ));

                    //right vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(
                        w/2,
                        h/2*(1-scalar*(2*i+1)/(numH-1)),
                        0
                    ));

                    lines.yaxis[i] = new THREE.Line(
                                         gridlineGeom,
                                         new THREE.LineBasicMaterial({color: 0x444444})
                                     );

                    //label canvas
                    addAxisLabelCanvas('yaxis', i);

                    //label mesh
                    addAxisLabelMesh('yaxis', i);

                    //set horizontal label values including value at and color of the x-axis
                    switch(true) {

                        case (i < (numH-1)/2):
                            labels.yaxis.context[i].fillText((range[dataVal]*(1-2*i/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                            break;

                        case (i > (numH-1)/2):
                            labels.yaxis.context[i].fillText((-range[dataVal]*(1-2*(numH-1-i)/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                            break;

                        case (i == (numH-1)/2):
                            labels.yaxis.context[i].fillText('0', canvasW/2, canvasH/2);
                            lines.yaxis[i].material.color.setHex(0x777777);
                            break;
                    }

                    //set label position
                    labels.yaxis.mesh[i].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*i+1+(0.6)/4)/(numH-1)-(0.002))), 0);

                    //add gridline and label to the scene
                    scene.add(lines.yaxis[i], labels.yaxis.mesh[i]);
                }
            }());
            

            var addXAxisComponents = (function() {

                //add vertical tick marks, tick mark extensions, dotted lines and labels
                for(var i=0; i<numV; i++) {

                    //tick mark geometry
                    var tickGeom = new THREE.Geometry();

                    //top vertex
                    tickGeom.vertices.push(new THREE.Vector3(
                        w*(scalar*(sDD(i)/(g.STOCKRANGE_LENGTH-1)-1)+0.5),
                        h/2*(1-scalar*2),
                        0
                    ));

                    //center vertex
                    tickGeom.vertices.push(new THREE.Vector3(
                        w*(scalar*(sDD(i)/(g.STOCKRANGE_LENGTH-1)-1)+0.5),
                        h/2*(1-scalar*(2*numH-1)/(numH-1)),
                        0
                    ));

                    //bottom vertex
                    tickGeom.vertices.push(new THREE.Vector3(
                        w*(scalar*(sDD(i)/(g.STOCKRANGE_LENGTH-1)-1)+0.5),
                        h/2*(1-scalar*(2*numH)/(numH-1)),
                        0
                    ));

                    lines.xaxis.tick[i] = new THREE.Line(
                                              tickGeom,
                                              new THREE.LineBasicMaterial({color: 0xffff00})
                                          );

                    //label canvas
                    addAxisLabelCanvas('xaxis', i);

                    //label mesh
                    addAxisLabelMesh('xaxis', i);

                    //label text
                    labels.xaxis.context[i].fillText(Object.keys(g.PROFITLOSS_DATA[0])[sDD(i)], canvasW/2*0.75, canvasH/2);

                    if(i==0 || i==6) {

                        //add dots
                        addDots(i, 1.5*w*scalar/500, 0xffff00);

                        //add extension
                        extendTick(i);

                        if(i == 0) {

                            //bump label right
                            labels.xaxis.mesh[i].position.set(
                                w*(scalar*(sDD(i)/(g.STOCKRANGE_LENGTH-1)-1-1.01*0.375)+0.375+0.5),
                                h*(scalar/(1-numH)*(numH+0.45)+0.5),
                                0
                            );
                        } else {

                            //bump label left
                            labels.xaxis.mesh[i].position.set(
                                w*(scalar*(sDD(i)/(g.STOCKRANGE_LENGTH-1)-1+1.01*0.375)-0.375+0.5),
                                h*(scalar/(1-numH)*(numH+0.45)+0.5),
                                0
                            );
                        }
                    } else {

                        //add dots
                        addDots(i, w*scalar/500, 0xaaaa00);

                        //set label position
                        labels.xaxis.mesh[i].position.set(
                            w*(scalar*(sDD(i)/(g.STOCKRANGE_LENGTH-1)-1)+0.5),
                            h*(scalar/(1-numH)*(numH+0.45)+0.5),
                            0
                        );
                    }

                    //add dotted line, tick mark and label to the scene
                    scene.add(lines.xaxis.dots[i], lines.xaxis.tick[i], labels.xaxis.mesh[i]);
                }
            }());
        }


        //add mouse cursor tracker and its associated elements
        var addTracker = function() {

            var addLineAndMesh = (function() {

                //line geometry 
                var trackerGeom = new THREE.Geometry();

                //top vertex
                trackerGeom.vertices.push(new THREE.Vector3(
                    0,
                    h/2*(1-scalar/(numH-1)),
                    0.00002
                ));

                //center vertex
                trackerGeom.vertices.push(new THREE.Vector3(
                    0,
                    h/2*(1-scalar*(numH)/(numH-1)),
                    0.00002
                ));

                //bottom vertex
                trackerGeom.vertices.push(new THREE.Vector3(
                    0,
                    h/2*(1-scalar*(2*numH-1)/(numH-1)),
                    0.00002
                ));

                //line
                trackerLine = new THREE.Line(
                                  trackerGeom,
                                  new THREE.LineBasicMaterial({color: 0x00ff00})
                              );

                //create the canvas
                var trackerCanvas        = document.createElement('canvas');
                    trackerCanvas.width  = canvasW*0.75;
                    trackerCanvas.height = canvasH;

                //get context, set transparent canvas background
                trackerContext           = trackerCanvas.getContext('2d');
                trackerContext.fillStyle = 'rgba(100,100,100,0.5)';
                trackerContext.fillRect(0, 0, canvasW*0.75, canvasH);

                //set color, font and alignment for the text
                trackerContext.fillStyle    = 'rgb(25,255,25)';
                trackerContext.font         = canvasH - 1 +'px Arial';
                trackerContext.textAlign    = 'center';
                trackerContext.textBaseline = 'middle';

                //set canvas as texture and specify texture property values
                trackerTexture             = new THREE.Texture(trackerCanvas);
                trackerTexture.minFilter   = THREE.LinearFilter;
                trackerTexture.needsUpdate = true;

                //create mesh and map canvas texture to it
                trackerMesh = new THREE.Mesh(
                                new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*0.75, h*(0.6)*scalar/(numH-1), 1, 1),
                                new THREE.MeshBasicMaterial({transparent: true, map: trackerTexture})
                              );

                //set mesh position
                trackerMesh.position.set(w/2*(1-scalar), h*(scalar/(1-numH)*(numH+0.45)+0.5), 0.00002);

                //set initial visibility and add tracker line and mesh to the scene
                trackerLine.visible = false;
                trackerMesh.visible = false;

                scene.add(trackerLine, trackerMesh);
            }());


            var addToOutputDataTracker = (function() {

                //local vars
                var divs = [ [obj.min(g.EXPIRY)+" DTE - 16:00 EDT :", "current-end-text", "current-end-val"],
                             ["Expiry - 12:45 EDT :", "expiry-mid-text", "expiry-mid-val"],
                             ["Expiry - 16:00 EDT :", "expiry-end-text", "expiry-end-val"] ],

                    sty1 = "height: 1.25vw; margin-top: 0.25vw; padding-top: 0.1875vw; font-size: 0.85vw; color: #aaaaaa; border-top: 1px solid #444444",
                    sty2 = "height: 1.25vw; font-size: 0.85vw; border-bottom: 1px solid #444444;",
                    ele  = "output-data-tracker";

                divs.forEach(function(arr, idx) {

                    elem.create({tag: "div", content: arr[0], attributes: {id: arr[1], style: sty1}}, ele);

                    elem.create({tag: "div", attributes: {id: arr[2], style: sty2+" color: "+["#0000ff","#aa00ff","#ff0000"][idx]}}, ele);
                });
            }());
        }


        //listen for graph data display change
        var addGraphChangeListener = function() {

            for(var i=1; i<=dataArr.length; i++) {

                (function(n) {

                    elem.select("output-data-radio-"+n).addEventListener('click', function() {

                        //remove the old point clouds
                        scene.remove(cloud[dataVal][0], cloud[dataVal][1], cloud[dataVal][2]);

                        //get the new data's info
                        dataVal = +elem.select("input[name=output-data-radio]:checked").value;

                        //add the new ones
                        scene.add(cloud[dataVal][0], cloud[dataVal][1], cloud[dataVal][2]);

                        //change y-axis label values
                        for(var j=0; j<numH; j++) {

                            switch(true) {

                                case j < (numH-1)/2:
                                    labels.yaxis.context[j].clearRect(0, 0, canvasW, canvasH);
                                    labels.yaxis.context[j].fillText((range[dataVal]*(1-2*j/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                                    labels.yaxis.texture[j].needsUpdate = true;
                                    break;

                                case j > (numH-1)/2:
                                    labels.yaxis.context[j].clearRect(0, 0, canvasW, canvasH);
                                    labels.yaxis.context[j].fillText((-range[dataVal]*(1-2*(numH-1-j)/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                                    labels.yaxis.texture[j].needsUpdate = true;
                                    break;

                                default:
                                    break;
                            }
                        }
                    });
                })(i);
            }
        }


        //listen for graph data time change
        var addTimeChangeListener = function() {

            elem.select("output-time-button").onclick = function() {

                //local vars
                var ele = "output-time-field",
                    val = +elem.select(ele).value;

                switch(false) {

                    //some error handling
                    case val != "" && val >= 1 && val <= obj.min(g.EXPIRY) && val == Math.floor(val):
                        //message
                        errorMsg(ele, "Please enter a whole number between 1 and "+obj.min(g.EXPIRY)+" for the number of calendar days to expiry.");
                        return;

                    default:
                        //assign new time = t to the time array
                        timeArr[2] = val;

                        elem.select("current-end-text").innerText = val + " DTE - 16:00 EDT :";

                        //point clouds
                        for(var i=1; i<=dataArr.length; i++) {

                            //remove the old time = t cloud
                            scene.remove(cloud[i][2]);

                            //create new time = t cloud
                            cloud[i][2] = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({ size: 0.0035*w*scalar, color: 0x0000ff }));

                            //push new vertices to the point cloud geometries
                            pushVertices(dataArr[i-1][obj.min(g.EXPIRY)-val], 2, i);
                        }
                        break;
                }

                //get current data info
                dataVal = +elem.select("input[name=output-data-radio]:checked").value;

                //add the current point cloud to the scene
                scene.add(cloud[dataVal][2]);
            }
        }


        var animateTracker = function() {

            if(mouse.x != null && mouse.y != null && elem.select("output-data-tracker").children.length == 6) {

                if(mouse.x > -0.85 && mouse.x < 1 && mouse.y < 1 && mouse.y > -1) {

                    (function(callback) {

                        //local vars
                        var vec,
                            dir,
                            distance;

                        //thanks to 'uhura' on stackoverflow.com for this
                        vec      = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
                        dir      = vec.sub(camera.position).normalize();
                        distance = -camera.position.z/dir.z;

                        tracker  = camera.position.clone().add(dir.multiplyScalar(distance));

                        //line movement
                        trackerLine.position.x = tracker.x;

                        //mesh movement - restrict to the bounds of plane2
                        if(tracker.x >= w*(-scalar*(1+1.01*0.375)+0.375+0.5) && tracker.x <= w*(scalar*(1.01*0.375)-0.375+0.5)) { trackerMesh.position.x = tracker.x }

                        //update the mesh
                        for(var i=0; i<g.STOCKRANGE_LENGTH; i++) {

                            if(Math.abs(tracker.x-cloud[1][0].geometry.vertices[i].x) < (w*scalar)/(2*g.STOCKRANGE_LENGTH)) {

                                //clear previous background and value
                                trackerContext.clearRect(0, 0, canvasW*0.75, canvasH);

                                //new background
                                trackerContext.fillStyle = 'rgba(100,100,100,0.5)';
                                trackerContext.fillRect(0, 0, canvasW*0.75, canvasH);

                                //new value
                                trackerContext.fillStyle = 'rgb(25,255,25)';
                                trackerContext.fillText(Object.keys(dataArr[dataVal-1][0])[i], canvasW/2*0.75, canvasH/2);

                                //update texture
                                trackerTexture.needsUpdate = true;

                                //update 'output-data-tracker' values
                                var updateOutputDataTracker = (function() {

                                    //local var
                                    var exp = obj.min(g.EXPIRY);

                                    [["current-end-val", +elem.select("output-time-field").value], ["expiry-mid-val", 0.5], ["expiry-end-val", 0]].forEach(function(arr) {

                                        var dat  = dataArr[dataVal-1][exp-arr[1]],
                                            text = dat[Object.keys(dat)[i]];

                                        elem.select(arr[0]).innerText = text || "-";
                                    });
                                }());
                            }
                        }

                        //visibility
                        var callback = function() { [trackerLine, trackerMesh].forEach(function(ele) { ele.visible = true }) }();
                    })();
                } else {

                    //visibility
                    [trackerLine, trackerMesh].forEach(function(ele) { ele.visible = false });

                    //clear 'output-data-tracker' values
                    ["current-end-val", "expiry-mid-val", "expiry-end-val"].forEach(function(ele) { elem.select(ele).innerText = "-" });
                }
            } else { return }
        }

        // MAIN =====================================================================================================================================

        var appendRenderer = (function() {

            if(elem.select("output-view-container") != null) {

                //set renderer params
                renderer.setSize(width,height);
                renderer.setClearColor(0x000000,0);
                elem.select("output-view-container").appendChild(renderer.domElement);

                //resize the renderer if window dimensions are changed
                window.addEventListener('resize', function onWindowResize() {

                    width  = elem.select("output-view-container").offsetWidth,
                    height = elem.select("output-view-container").offsetHeight;

                    renderer.setSize(width,height);
                    camera.aspect = (width/height);
                });
            }
        }());


        var addMouseListener = (function() {

            //normalize mouse coordinates with respect to the renderer
            window.addEventListener('mousemove', function onMouseMove(event) {

                mouse.x =  ((event.clientX-renderer.domElement.offsetLeft)/renderer.domElement.width)*2-1;
                mouse.y = -((event.clientY-renderer.domElement.offsetTop)/renderer.domElement.height)*2+1;
            }); 
        }());


        //create point clouds, initialize the graph, etc.
        setTimeout(function(callback) {

            dataArr.forEach(function(num, n) {

                //range of the data
                var rng = obj.range([ num[timeArr[0]], num[timeArr[1]], num[timeArr[2]] ]);

                range[n+1] = rng !== 0 ? (rng*1.02) : 1;

                //clouds
                cloud[n+1] = {};

                timeArr.forEach(function(time, t) {

                    cloud[n+1][t] = new THREE.Points(
                                        new THREE.Geometry(), 
                                        new THREE.PointsMaterial({ size: 0.0035*w*scalar, color: [0xff0000, 0xaa00ff, 0x0000ff][t] })
                                    );

                    //push vertices to the point cloud geometries
                    pushVertices(num[time], t, n+1);
                });
            });

            var callback = function() {

                //remove load icon and change background color
                elem.destroyChildren("output-data-tracker", ["BSM-load-icon"]);
                elem.select("output-data-tracker").style.backgroundColor = '#333333';

                //remove push text
                elem.destroyChildren("output-view-container", ["BSM-push-text"]);

                //status message
                console.log('point clouds full.');

                //get data info
                dataVal = +elem.select("input[name=output-data-radio]:checked").value;

                //set camera position
                camera.position.set(r*Math.sin(0)*Math.cos(0), r*Math.sin(0)*Math.sin(0), r*Math.cos(0));

                //add light, camera to the scene
                scene.add(light, camera);

                addGraphComponents();

                //add initial point clouds to the scene
                scene.add(cloud[1][0], cloud[1][1], cloud[1][2]);

                addTracker();
                addGraphChangeListener();
                addTimeChangeListener();

                //animation
                (function render() {

                    if(trackerLine && trackerMesh) { animateTracker() }

                    renderer.render(scene, camera);
                    requestAnimationFrame(render);
                })();

                //enable output data and output time elements
                var enableOutputElems = (function(bool) {

                    //data radio buttons
                    for(var i=1; i<=dataArr.length; i++) { elem.avail("output-data-radio-"+i, bool) }

                    ["output-time-field", "output-time-button"].forEach(function(ele) { elem.avail(ele, bool) });
                }(true));

                //display the global object in the console
                console.log(g);
            }();
        }, 50);
    }

    return visuals;
}());
