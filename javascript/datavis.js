visuals = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    init: function() {

        //local vars
        var width    = elem.select("output-view-container").offsetWidth,
            height   = elem.select("output-view-container").offsetHeight,
            scene    = new THREE.Scene(),
            renderer = new THREE.WebGLRenderer({antialias: false, alpha: true}),
            VFOVdeg  = 45,
            aspect   = width/height,
            near     = 0.1,
            far      = 100,
            camera   = new THREE.PerspectiveCamera(VFOVdeg, aspect, near, far),
            light    = new THREE.AmbientLight(0xffffff),

            mouse    = {x:0, y:0},

            //aspect ratio is 2.5 : 1
            w        = 1,
            h        = 0.4,
            r        = h/(2*Math.tan((VFOVdeg*Math.PI/180)/2)),

            scalar   = 0.925,
            numH     = 25,
            numV     = 7,

            //the multiplier for these dimensions fixes blurry text - is it related to 'devicePixelRatio'?
            canvasW  = 2*Math.floor(width*(1-(1.01)*scalar)),
            canvasH  = 2*Math.floor(height*(0.6)*scalar/(numH-1)),

            lines    = { xaxis: {tick: {}, ext: {}, dots: {}}, yaxis: {} },
            labels   = { xaxis: {canvas: {}, context: {}, texture: {}, mesh: {}}, yaxis: {canvas: {}, context: {}, texture: {}, mesh: {}} },
            tracker,
            trackerLine,
            trackerMesh,

            dataArr  = [g.PROFITLOSS_DATA, g.DELTA_DATA, g.GAMMA_DATA, g.THETA_DATA, g.VEGA_DATA, g.RHO_DATA],
            dataVal,
            timeArr  = [obj.min(g.EXPIRY), obj.min(g.EXPIRY)-0.5, 0],
            range    = [],
            cloud    = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };

        //set renderer params and attach when the container is available
        if(elem.select("output-view-container") != null) {

            renderer.setSize(width,height);
            renderer.setClearColor(0x000000,0);
            elem.select("output-view-container").appendChild(renderer.domElement);
        }

        //re-size the renderer if the window size is changed
        window.addEventListener('resize', function onWindowResize() {

            width  = elem.select("output-view-container").offsetWidth,
            height = elem.select("output-view-container").offsetHeight;

            renderer.setSize(width,height);
            camera.aspect = (width/height);
        });

        //add listener to store mouse coordinates
        window.addEventListener('mousemove', function onMouseMove(e) {

            mouse.x = ((event.clientX-renderer.domElement.offsetLeft)/renderer.domElement.width)*2-1;
            mouse.y = -((event.clientY-renderer.domElement.offsetTop)/renderer.domElement.height)*2+1;
        });

        //set camera position and add light, camera to the scene
        camera.position.set(r*Math.sin(0)*Math.cos(0), r*Math.sin(0)*Math.sin(0), r*Math.cos(0));
        scene.add(light, camera);


        // HELPERS ==================================================================================================================================

        //graph objects
        addGraphObjects = function() {

            //local vars for the background and gridlines
            var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({color: 0x888888})),
                plane2 = new THREE.Mesh(new THREE.PlaneGeometry(w*scalar, h*scalar, 1, 1), new THREE.MeshBasicMaterial({color: 0x333333}));

            //position the background and add it to the scene
            plane1.position.set(0, 0, 0);
            plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numH/(numH-1)), 0);
            scene.add(plane1, plane2);

            //axis label canvas, context, etc.
            addAxisLabelCanvas = function(axis, n) {

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
            addAxisLabelMesh = function(axis, n) {

                var p = axis == 'yaxis' ? 1 : 0.75;

                //set canvas as texture and specify texture parameters
                labels[axis].texture[n]             = new THREE.Texture(labels[axis].canvas[n]);
                labels[axis].texture[n].needsUpdate = true;

                //what does this actually do?
                labels[axis].texture[n].minFilter = THREE.LinearFilter;

                //create label mesh and map canvas texture to it
                labels[axis].mesh[n] = new THREE.Mesh( new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*p, h*(0.6)*scalar/(numH-1), 1, 1),
                                                       new THREE.MeshBasicMaterial({map: labels[axis].texture[n]}) );
            }

            //add horizontal gridlines and vertical axis labels
            for(i=0; i<numH; i++) {

                //gridlines
                var gridlineGeom = new THREE.Geometry();

                    gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar*2), h/2*(1-scalar*(2*i+1)/(numH-1)), 0)); //left vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar), h/2*(1-scalar*(2*i+1)/(numH-1)), 0)); //center vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(w/2, h/2*(1-scalar*(2*i+1)/(numH-1)), 0)); //right vertex

                lines.yaxis[i] = new THREE.Line(gridlineGeom, new THREE.LineBasicMaterial({color: 0x444444}));

                //label canvas
                addAxisLabelCanvas('yaxis', i);

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

                //label mesh
                addAxisLabelMesh('yaxis', i);

                //set label position
                labels.yaxis.mesh[i].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*i+1+(0.6)/4)/(numH-1)-(0.002))), 0);

                //add gridline and label to the scene
                scene.add(lines.yaxis[i], labels.yaxis.mesh[i]);
            }

            //add vertical tick marks and dotted lines as well as horizontal axis labels
            for(i=0; i<numV; i++) {

                //tick marks
                var tickGeom = new THREE.Geometry();

                tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*2), 0)); //top vertex
                tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*(2*numH-1)/(numH-1)), 0)); //center vertex
                tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*(2*numH)/(numH-1)), 0)); //bottom vertex

                lines.xaxis.tick[i] = new THREE.Line(tickGeom, new THREE.LineBasicMaterial({color: 0xffff00}));

                //dotted lines
                switch(i) {

                    //make the book-ends larger and brighter
                    case 0:
                    /* fall-through */
                    case 6:
                        lines.xaxis.dots[i] = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.5*w*scalar/500, color: 0xffff00}));
                        break;

                    default:
                        lines.xaxis.dots[i] = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: w*scalar/500, color: 0xaaaa00}));
                        break;
                }

                //add vertices (as vectors) to the dotted line geometries
                for(j=0; j<(4*numH-6); j++) {

                    lines.xaxis.dots[i].geometry.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h*(scalar*(0.25*(j+1)/(numH-1)-1)+0.5), 0));
                }

                //label canvas
                addAxisLabelCanvas('xaxis', i);

                //set label values from -3 to +3 implied standard deviations
                switch((g.STOCKRANGE_LENGTH-1) % (numV-1)) {

                    case 0:
                        var labelText = '$'+Object.keys(g.PROFITLOSS_DATA[0])[(g.STOCKRANGE_LENGTH-1)/(numV-1)*i];
                        break;

                    default:
                        switch(Math.floor((g.STOCKRANGE_LENGTH-1)/(numV-1))) {

                            //the case where the fractional part of the remainder is < 0.5; thanks to Michael Wunder for his help with this
                            case Math.round((g.STOCKRANGE_LENGTH-1)/(numV-1)):
                                var labelText = '$'+Object.keys(g.PROFITLOSS_DATA[0])[Math.floor((g.STOCKRANGE_LENGTH-1)/(numV-1))*i+Math.floor((i+1)/3)];
                                break;

                            //the case where the fractional part of the remainder is >= 0.5
                            default:
                                var labelText = '$'+Object.keys(g.PROFITLOSS_DATA[0])[Math.ceil((g.STOCKRANGE_LENGTH-1)/(numV-1))*i-Math.floor((i+1)/3)];
                                break;
                        }
                        break;
                }

                labels.xaxis.context[i].fillText(labelText, canvasW/2*0.75, canvasH/2);

                //label mesh
                addAxisLabelMesh('xaxis', i);

                //set label position, at book-ends bump in label and extend tick mark
                switch(i) {

                    case 0:
                        //bump label right
                        labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1-1.01*0.375)+0.375+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), 0);

                        //extend tick mark right
                        var extGeom = new THREE.Geometry();

                        extGeom.vertices.push(new THREE.Vector3(w*(-scalar+0.5), h/2*(1-scalar*(2*numH)/(numH-1)), 0)); //left vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.25*(-scalar*(1.01*0.75+4)+0.75+2), h/2*(1-scalar*(2*numH)/(numH-1)), 0)); //center vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.5*(-scalar*(1.01*0.75+2)+0.75+1), h/2*(1-scalar*(2*numH)/(numH-1)), 0)); //right vertex

                        lines.xaxis.ext[i] = new THREE.Line(extGeom, new THREE.LineBasicMaterial({color: 0xffff00}));
                        scene.add(lines.xaxis.ext[i]);
                        break;

                    case 6:
                        //bump label left
                        labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1+1.01*0.375)-0.375+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), 0);

                        //extend tick mark left
                        var extGeom = new THREE.Geometry();

                        extGeom.vertices.push(new THREE.Vector3(w*0.5*(0.75*(scalar*1.01-1)+1), h/2*(1-scalar*(2*numH)/(numH-1)), 0)); //left vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.25*(0.75*(scalar*1.01-1)+2), h/2*(1-scalar*(2*numH)/(numH-1)), 0)); //center vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.5, h/2*(1-scalar*(2*numH)/(numH-1)), 0)); //right vertex

                        lines.xaxis.ext[i] = new THREE.Line(extGeom, new THREE.LineBasicMaterial({color: 0xffff00}));
                        scene.add(lines.xaxis.ext[i]);
                        break;

                    default:
                        labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1)+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), 0);
                        break;
                }

                //add tick mark, dotted line and label to the scene
                scene.add(lines.xaxis.tick[i], lines.xaxis.dots[i], labels.xaxis.mesh[i]);
            }

            //add mouse cursor tracker line and mesh
            var trackerGeom = new THREE.Geometry();

            trackerGeom.vertices.push(new THREE.Vector3(0, h/2*(1-scalar/(numH-1)), 0.00002)); //top vertex
            trackerGeom.vertices.push(new THREE.Vector3(0, h/2*(1-scalar*(numH)/(numH-1)), 0.00002)); //center vertex
            trackerGeom.vertices.push(new THREE.Vector3(0, h/2*(1-scalar*(2*numH-1)/(numH-1)), 0.00002)); //bottom vertex

            trackerLine = new THREE.Line(trackerGeom, new THREE.LineBasicMaterial({color: 0x00ff00}));

            //create the canvas
            var trackerCanvas    = document.createElement('canvas');
            trackerCanvas.width  = canvasW*0.75;
            trackerCanvas.height = canvasH;

            //get context, set transparent canvas background
            var trackerContext       = trackerCanvas.getContext('2d');
            trackerContext.fillStyle = 'rgba(100,100,100,0.5)';
            trackerContext.fillRect(0, 0, canvasW*0.75, canvasH);

            //set color, font and alignment for the text
            trackerContext.fillStyle    = 'rgb(25,255,25)';
            trackerContext.font         = canvasH - 1 +'px Arial';
            trackerContext.textAlign    = 'center';
            trackerContext.textBaseline = 'middle';

            //set value
            trackerContext.fillText('$100.25', canvasW/2*0.75, canvasH/2);

            //set canvas as texture and specify texture parameters
            var trackerTexture         = new THREE.Texture(trackerCanvas);
            trackerTexture.needsUpdate = true;

            //what does this actually do?
            trackerTexture.minFilter = THREE.LinearFilter;

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
        }


        //listen for graph data display change
        addGraphChangeListener = function() {

            for(i=1; i<7; i++) {

                (function(n) {

                    elem.select("output-data-radio-"+n).addEventListener('click', function() {

                        //remove the old point clouds
                        scene.remove(cloud[dataVal][0], cloud[dataVal][1], cloud[dataVal][2]);

                        //get the new data's info
                        dataVal = +elem.select("input[name=output-data-radio]:checked").value;

                        //add the new ones
                        scene.add(cloud[dataVal][0], cloud[dataVal][1], cloud[dataVal][2]);

                        //change y-axis label values
                        for(j=0; j<numH; j++) {

                            switch(true) {

                                case (j < (numH-1)/2):
                                    labels.yaxis.context[j].clearRect(0, 0, canvasW, canvasH);
                                    labels.yaxis.context[j].fillText((range[dataVal]*(1-2*j/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                                    labels.yaxis.texture[j].needsUpdate = true;
                                    break;

                                case (j > (numH-1)/2):
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
        addTimeChangeListener = function() {

            elem.select("output-time-button").onclick = function() {

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

                        //point clouds
                        for(i=1; i<7; i++) {

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


        animateTracker = function() {

            //thanks to 'uhura' on stackoverflow.com for this
            var vec = new THREE.Vector3(mouse.x, mouse.y, 0.5);

            vec.unproject(camera);

            var dir = vec.sub(camera.position).normalize();

            var distance = -camera.position.z/dir.z;

            tracker = camera.position.clone().add(dir.multiplyScalar(distance));


            switch(false) {

                //left, right, top, bottom boundaries for cursor tracking 
                case tracker.x >= w/2-w*scalar :
                /* fall through */
                case tracker.x <= w/2 :
                /* fall through */
                case tracker.y <= h/2 :
                /* fall through */
                case tracker.y >= -h/2 :
                    //toggle tracker visibility
                    if(trackerLine.visible == true) {
                        trackerLine.visible = false;
                        trackerMesh.visible = false;
                    }
                    break;

                default:
                    //toggle tracker visibility
                    if(trackerLine.visible == false) {
                        trackerLine.visible = true;
                        trackerMesh.visible = true;
                    }

                    trackerLine.position.x = tracker.x;

                    //reduce the time complexity of the search
                    switch(true) {

                        //region 1 (-3sd to -2sd)
                        case tracker.x >= w/2-w*scalar && tracker.x < w/2-w*scalar*(1-1/6) :
                            //stop mesh movement if its position reaches the left-most label
                            if(tracker.x >= w*(-scalar*(1+1.01*0.375)+0.375+0.5)) { trackerMesh.position.x = tracker.x }


                            break;

                        //region 2 (-2sd to -1sd)
                        case tracker.x >= w/2-w*scalar*(5/6) && tracker.x < w/2-w*scalar*(1-2/6) :
                            trackerMesh.position.x = tracker.x;


                            break;

                        //region 3 ...
                        case tracker.x >= w/2-w*scalar*(4/6) && tracker.x < w/2-w*scalar*(1-3/6) :
                            trackerMesh.position.x = tracker.x;


                            break;

                        //region 4
                        case tracker.x >= w/2-w*scalar*(3/6) && tracker.x < w/2-w*scalar*(1-4/6) :
                            trackerMesh.position.x = tracker.x;


                            break;

                        //region 5
                        case tracker.x >= w/2-w*scalar*(2/6) && tracker.x < w/2-w*scalar*(1-5/6) :
                            trackerMesh.position.x = tracker.x;


                            break;


                        //region 6
                        case tracker.x >= w/2-w*scalar*(1/6) && tracker.x < w/2 :
                            //stop mesh movement if its position reaches the right-most label
                            if(tracker.x <= w*(scalar*(1.01*0.375)-0.375+0.5)) { trackerMesh.position.x = tracker.x }


                            break;
                    }

                    //console.log(tracker.x);
                    break;
            }
        }


        //write IV and 'greeks' info to the trade summary table
        addTableData = function() {

            for(i=1; i<g.TRADE_LEGS+1; i++) {

                //local loop vars
                var ele = "leg-"+i+"-",
                    arr = ['delta','gamma','theta','vega','rho'];

                //IV
                elem.select(ele+"iv").innerHTML   = (g.IMPLIED_VOL[i]*Math.pow(10,2)).toFixed(2) + "%";
                elem.select(ele+"iv").style.color = g.LONG_SHORT[i] == 1 ? "rgb(0,175,0)" : "rgb(200,0,0)";
                elem.select(ele+"iv").style.borderRightColor = "rgb(0,0,0)";

                //'greeks'
                arr.forEach(function(greek) { elem.select(ele+greek).innerHTML = g[greek.toUpperCase()][i].toFixed(2) });
            }

            //'greeks' totals
            arr.forEach(function(greek) { elem.select(greek+"-total").innerHTML = obj.sum(g[greek.toUpperCase()]).toFixed(2) });
        }


        //push vertices to point cloud geometry
        pushVertices = function(oArr, tIdx, dVal) {

            for(datum in oArr) {

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

        // END HELPERS ==============================================================================================================================


        // MAIN =====================================================================================================================================

        addTableData();

        setTimeout(function() {

            //push initial data to point clouds
            (pushInitialData = function(callback) {

                dataArr.forEach(function(num, n) {

                    //range of the data
                    var rng = obj.range([ num[timeArr[0]], num[timeArr[1]], num[timeArr[2]] ]);

                    range[n+1] = rng !== 0 ? (rng*1.025) : 1;

                    //point clouds
                    timeArr.forEach(function(time, t) {

                        //create cloud objects
                        cloud[n+1][t] = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({ size: 0.0035*w*scalar, color: [0xff0000, 0xaa00ff, 0x0000ff][t] }));

                        //push vertices to the point cloud geometries
                        pushVertices(num[time], t, n+1);
                    });
                });

                callback = function() {

                    //remove 'pushing data' text
                    elem.destroyChildren("output-view-container", ["BSM-push-text"]);

                    //status message
                    console.log('point clouds full.');

                    //get data info
                    dataVal = +elem.select("input[name=output-data-radio]:checked").value;

                    //add initial point clouds to the scene
                    scene.add(cloud[1][0], cloud[1][1], cloud[1][2]);

                    addGraphObjects();
                    addGraphChangeListener();
                    addTimeChangeListener();

                    //animation
                    (render = function() {
                                
                        if(trackerLine && trackerMesh) { animateTracker() }
                                            
                        renderer.render(scene, camera);
                        requestAnimationFrame(render);

                        //console.log();
                    })();

                    //enable output data and output time elements
                    for(i=1; i<7; i++) { elem.avail("output-data-radio-"+i, true) }
                    ["output-time-field", "output-time-button"].forEach(function(ele) { elem.avail(ele, true) });
                    ["output-data-form" ,   "output-time-form"].forEach(function(ele) { elem.select(ele).style.backgroundColor = '#fafafa' });

                    //display the global object in the console
                    console.log(g, cloud);
                }();
            })();
        }, 50);

        // END MAIN =================================================================================================================================
    }
})
