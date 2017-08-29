"use strict";

var graphics = (function() {
    //*** private variables
    var self = {};

    //aspect ratio is 2.5:1
    var width = elem.select("output-view-container").offsetWidth,
        height = elem.select("output-view-container").offsetHeight,
        renderer = new THREE.WebGLRenderer({antialias: false, alpha: true}),
        scene = new THREE.Scene(),
        VFOVdeg = 45,
        near = 0.1,
        far = 10,
        camera = new THREE.PerspectiveCamera(VFOVdeg,width/height,near,far),
        mouse = {x:null, y:null},
        w = 1,
        h = 0.4,
        scalar = 0.925,
        numH = 25,
        numV = 7,
        canvasW = Math.floor(width*(1-(1.01)*scalar)),
        canvasH = Math.floor(height*(0.6)*scalar/(numH-1)),
        lines = { xaxis: {tick: {},ext: {},dots: {}}, yaxis: {} },
        labels = { xaxis: {canvas: {},context: {},texture: {},mesh: {}}, yaxis: {canvas: {},context: {},texture: {},mesh: {}} },
        tracker = { line: null, context: null, texture: null, mesh: null, pos: null };

    var dataArr,
        dataNum,
        timeArr,
        range = [],
        cloud = {};

    //*** private methods
    var fillPointClouds = function(arr,n,t) {
        for(var price in arr) {
            cloud[n][t].geometry.vertices.push(new THREE.Vector3(
                //x
                w*(scalar*(Object.keys(arr).indexOf(price)/(obj.size(arr)-1)-1)+0.5),
                //y
                h/2*(scalar*(obj.sum(arr[price])/range[n]-numH/(numH-1))+1),
                //z
                0.00001
            ));
        }
    };

    var initializePointClouds = function(callback) {
        dataArr = [ trade.data.profit ];
        for(var greek in trade.data.greeks) { dataArr.push(trade.data.greeks[greek]) }

        timeArr = [ trade.expiryMin, trade.expiryMin-0.5, 0 ];

        dataArr.forEach(function(num,n) {
            //data ranges
            var storeRange = (function() {
                var rng = obj.range([num[timeArr[0]], num[timeArr[1]], num[timeArr[2]]]);

                range[n+1] = rng !== 0 ? (rng*1.02) : 1;
            }());

            //clouds
            cloud[n+1] = {};

            timeArr.forEach(function(time,t) {
                cloud[n+1][t] = new THREE.Points(
                                    new THREE.Geometry(), 
                                    new THREE.PointsMaterial({ size: 0.0035*w*scalar, color: [0xff0000, 0xaa00ff, 0x0000ff][t] })
                                );

                //push vertices to geometries
                fillPointClouds(num[time], n+1, t);
            });
        });

        //status update
        console.log('point clouds full.');

        callback();
    };

    var setRenderer = function() {
        if(elem.select("output-view-container") != null) {
            renderer.setSize(width,height);
            renderer.setClearColor(0x000000,0);
            elem.select("output-view-container").appendChild(renderer.domElement);
        }
    };

    var addGraphComponents = function() {
        var addBackground = (function() {
            //meshes
            var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w,h,1,1),new THREE.MeshBasicMaterial({color: 0x888888})),
                plane2 = new THREE.Mesh(new THREE.PlaneGeometry(w*scalar,h*scalar,1,1),new THREE.MeshBasicMaterial({color: 0x333333}));

            //set positions
            plane1.position.set(0, 0, 0);
            plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numH/(numH-1)), 0);
            scene.add(plane1, plane2);
        }());

        var addAxesComponents = (function() {
            var addLabelComponents = function(axis,l) {
                var p = axis == 'yaxis' ? 1 : 0.75;

                //create the canvas
                labels[axis].canvas[l] = document.createElement('canvas');
                labels[axis].canvas[l].width  = canvasW*p;
                labels[axis].canvas[l].height = canvasH;
                //get context, paint the canvas background
                labels[axis].context[l] = labels[axis].canvas[l].getContext('2d');
                labels[axis].context[l].fillStyle = '#888888';
                labels[axis].context[l].fillRect(0,0,canvasW*p,canvasH);
                //set color, font and alignment for the text
                labels[axis].context[l].fillStyle = 'black';
                labels[axis].context[l].font = (canvasH-1)+'px Arial';
                labels[axis].context[l].textAlign = 'center';
                labels[axis].context[l].textBaseline = 'middle';

                //set canvas as texture and specify texture property values
                labels[axis].texture[l] = new THREE.Texture(labels[axis].canvas[l]);
                labels[axis].texture[l].minFilter = THREE.LinearFilter;
                labels[axis].texture[l].needsUpdate = true;
                //create label mesh and map canvas texture to it
                labels[axis].mesh[l] = new THREE.Mesh(
                                           new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*p, h*(0.6)*scalar/(numH-1), 1, 1),
                                           new THREE.MeshBasicMaterial({map: labels[axis].texture[l]})
                                       );
            };

            var YAxis = (function() {
                //add horizontal gridlines and vertical axis labels
                for(var y=0; y<numH; y++) {
                    //gridline geometry
                    var gridlineGeom = new THREE.Geometry();

                    //left vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(
                        w/2*(1-(1.01)*scalar*2),
                        h/2*(1-scalar*(2*y+1)/(numH-1)),
                        0
                    ));
                    //center vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(
                        w/2*(1-(1.01)*scalar),
                        h/2*(1-scalar*(2*y+1)/(numH-1)),
                        0
                    ));
                    //right vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(
                        w/2,
                        h/2*(1-scalar*(2*y+1)/(numH-1)),
                        0
                    ));

                    lines.yaxis[y] = new THREE.Line(gridlineGeom,new THREE.LineBasicMaterial({color: 0x444444}));
                    addLabelComponents('yaxis',y);

                    //set horizontal label values including value at and color of the x-axis
                    switch(true) {
                        case (y < (numH-1)/2):
                            labels.yaxis.context[y].fillText((range[dataNum]*(1-2*y/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                            break;
                        case (y > (numH-1)/2):
                            labels.yaxis.context[y].fillText((-range[dataNum]*(1-2*(numH-1-y)/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                            break;
                        case (y == (numH-1)/2):
                            labels.yaxis.context[y].fillText('0',canvasW/2,canvasH/2);
                            lines.yaxis[y].material.color.setHex(0x777777);
                            break;
                    }

                    //set label position
                    labels.yaxis.mesh[y].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*y+1+(0.6)/4)/(numH-1)-(0.002))), 0);
                    //add gridline and label to the scene
                    scene.add(lines.yaxis[y], labels.yaxis.mesh[y]);
                }
            }());

            var XAxis = (function() {
                //find the distance to 1 standard deviation in terms of vertical gridline indicies
                var indexDeviation = function(index) {
                    var d;

                    switch((trade.priceSpace.length-1) % (numV-1)) {
                        case 0:
                            d = (trade.priceSpace.length-1)/(numV-1)*index;
                            break;
                        default:
                            switch(Math.floor((trade.priceSpace.length-1)/(numV-1))) {
                                //the case where the fractional part of the remainder is < 0.5; thanks to Michael Wunder for his help
                                case Math.round((trade.priceSpace.length-1)/(numV-1)):
                                    d = Math.floor((trade.priceSpace.length-1)/(numV-1))*index+Math.floor((index+1)/3);
                                    break;
                                //the case where the fractional part of the remainder is >= 0.5
                                default:
                                    d = Math.ceil((trade.priceSpace.length-1)/(numV-1))*index-Math.floor((index+1)/3);
                                    break;
                            }
                            break;
                    }

                    return d;
                };

                //dotted vertical gridlines
                var addDots = function(index, size, col) {
                    var x = w*(scalar*(indexDeviation(index)/(trade.priceSpace.length-1)-1)+0.5);

                    lines.xaxis.dots[index] = new THREE.Points(new THREE.Geometry(),new THREE.PointsMaterial({size: size, color: col}));

                    //add vertices
                    for(var v=0; v<(4*numH-6); v++) {
                        lines.xaxis.dots[index].geometry.vertices.push(new THREE.Vector3(
                            x,
                            h*(scalar*(0.25*(v+1)/(numH-1)-1)+0.5),
                            0
                        ));
                    }
                };

                //extend left or right-most vertical tick mark
                var extendTick = function(index) {
                    var x = { 0: { left: w*(-scalar+0.50),
                                   center: w*0.25*(-scalar*(1.01*0.75+4)+0.75+2),
                                   right: w*0.50*(-scalar*(1.01*0.75+2)+0.75+1) },

                              6: { left: w*0.50*(0.75*(scalar*1.01-1)+1),
                                   center: w*0.25*(0.75*(scalar*1.01-1)+2),
                                   right: w*0.50 } },

                        y = h/2*(1-scalar*(2*numH)/(numH-1)),

                    extGeom = new THREE.Geometry();

                    //left vertex
                    extGeom.vertices.push(new THREE.Vector3(
                        x[index].left,
                        y,
                        0
                    ));
                    //center vertex
                    extGeom.vertices.push(new THREE.Vector3(
                        x[index].center,
                        y,
                        0
                    ));
                    //right vertex
                    extGeom.vertices.push(new THREE.Vector3(
                        x[index].right,
                        y,
                        0
                    ));

                    lines.xaxis.ext[index] = new THREE.Line(extGeom,new THREE.LineBasicMaterial({color: 0xffff00}));
                    scene.add(lines.xaxis.ext[index]);
                };

                //add vertical tick marks, tick mark extensions, dotted gridlines and labels
                for(var x=0; x<numV; x++) {
                    //tick mark geometry
                    var tickGeom = new THREE.Geometry();

                    //top vertex
                    tickGeom.vertices.push(new THREE.Vector3(
                        w*(scalar*(indexDeviation(x)/(trade.priceSpace.length-1)-1)+0.5),
                        h/2*(1-scalar*2),
                        0
                    ));
                    //center vertex
                    tickGeom.vertices.push(new THREE.Vector3(
                        w*(scalar*(indexDeviation(x)/(trade.priceSpace.length-1)-1)+0.5),
                        h/2*(1-scalar*(2*numH-1)/(numH-1)),
                        0
                    ));
                    //bottom vertex
                    tickGeom.vertices.push(new THREE.Vector3(
                        w*(scalar*(indexDeviation(x)/(trade.priceSpace.length-1)-1)+0.5),
                        h/2*(1-scalar*(2*numH)/(numH-1)),
                        0
                    ));

                    lines.xaxis.tick[x] = new THREE.Line(tickGeom,new THREE.LineBasicMaterial({color: 0xffff00}));
                    addLabelComponents('xaxis',x);
                    //label text
                    labels.xaxis.context[x].fillText(Object.keys(trade.data.profit[0])[indexDeviation(x)], canvasW/2*0.75, canvasH/2);

                    if(x==0 || x==6) {
                        addDots(x, 1.5*w*scalar/500, 0xffff00);
                        extendTick(x);

                        if(x == 0) {
                            //shift right
                            labels.xaxis.mesh[x].position.set(
                                w*(scalar*(indexDeviation(x)/(trade.priceSpace.length-1)-1-1.01*0.375)+0.375+0.5),
                                h*(scalar/(1-numH)*(numH+0.45)+0.5),
                                0
                            );
                        } else {
                            //shift left
                            labels.xaxis.mesh[x].position.set(
                                w*(scalar*(indexDeviation(x)/(trade.priceSpace.length-1)-1+1.01*0.375)-0.375+0.5),
                                h*(scalar/(1-numH)*(numH+0.45)+0.5),
                                0
                            );
                        }
                    } else {
                        addDots(x, w*scalar/500, 0xaaaa00);
                        //set position
                        labels.xaxis.mesh[x].position.set(
                            w*(scalar*(indexDeviation(x)/(trade.priceSpace.length-1)-1)+0.5),
                            h*(scalar/(1-numH)*(numH+0.45)+0.5),
                            0
                        );
                    }

                    scene.add(lines.xaxis.dots[x], lines.xaxis.tick[x], labels.xaxis.mesh[x]);
                }
            }());
        }());

        //add mouse cursor tracker and its associated elements
        var addTracker = (function() {
            //line geometry and mesh canvas
            var trackerGeom = new THREE.Geometry(),
                trackerCanvas = document.createElement('canvas');

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
            tracker.line = new THREE.Line(trackerGeom,new THREE.LineBasicMaterial({color: 0x00ff00}));
            
            trackerCanvas.width = canvasW*0.75;
            trackerCanvas.height = canvasH;

            //get context, set transparent background
            tracker.context = trackerCanvas.getContext('2d');
            tracker.context.fillStyle = 'rgba(100,100,100,0.5)';
            tracker.context.fillRect(0,0,canvasW*0.75,canvasH);
            //set color, font and alignment for the text
            tracker.context.fillStyle = 'rgb(25,255,25)';
            tracker.context.font = canvasH - 1 +'px Arial';
            tracker.context.textAlign = 'center';
            tracker.context.textBaseline = 'middle';

            //set canvas as texture and specify texture property values
            tracker.texture = new THREE.Texture(trackerCanvas);
            tracker.texture.minFilter = THREE.LinearFilter;
            tracker.texture.needsUpdate = true;

            //mesh
            tracker.mesh = new THREE.Mesh(
                              new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*0.75, h*(0.6)*scalar/(numH-1), 1, 1),
                              new THREE.MeshBasicMaterial({transparent: true, map: tracker.texture})
                          );

            //set position
            tracker.mesh.position.set(w/2*(1-scalar), h*(scalar/(1-numH)*(numH+0.45)+0.5), 0.00002);

            //set initial visibility
            tracker.line.visible = false;
            tracker.mesh.visible = false;
            scene.add(tracker.line,tracker.mesh);
        }());
    };

    var addOutputDataTrackerElements = function() {
        var ele = "output-data-tracker",
            sty1 = "height: 1.25vw; margin-top: 0.25vw; padding-top: 0.1875vw; font-size: 0.85vw; color: #aaaaaa; border-top: 1px solid #444444",
            sty2 = "height: 1.25vw; font-size: 0.85vw; border-bottom: 1px solid #444444;",
            divs = [ [trade.expiryMin+" DTE - 16:00 EDT :", "current-end-text", "current-end-val"],
                     ["Expiry - 12:45 EDT :", "expiry-mid-text", "expiry-mid-val"],
                     ["Expiry - 16:00 EDT :", "expiry-end-text", "expiry-end-val"] ];

        //creates 6 children
        divs.forEach(function(arr, index) {
            elem.create({tag: "div", content: arr[0], attributes: {id: arr[1], style: sty1}}, ele);
            elem.create({tag: "div", attributes: {id: arr[2], style: sty2+" color: "+["#0000ff","#aa00ff","#ff0000"][index]}}, ele);
        });
    };

    var updateTracker = function() {
        if(mouse.x > -0.85 && mouse.x < 1 && mouse.y < 1 && mouse.y > -1) {
            var vec,
                dir,
                dist;

            //thanks to 'uhura' on stackoverflow.com
            vec = new THREE.Vector3(mouse.x,mouse.y,0.5).unproject(camera);
            dir = vec.sub(camera.position).normalize();
            dist = -camera.position.z/dir.z;
            tracker.pos = camera.position.clone().add(dir.multiplyScalar(dist));

            //line movement
            tracker.line.position.x = tracker.pos.x;
            //restrict mesh movement to plane2 boundaries
            if(tracker.pos.x >= w*(-scalar*(1+1.01*0.375)+0.375+0.5) && tracker.pos.x <= w*(scalar*(1.01*0.375)-0.375+0.5)) {
                tracker.mesh.position.x = tracker.pos.x;
            }

            //update mesh
            for(var p=0; p<trade.priceSpace.length; p++) {
                if(Math.abs(tracker.pos.x-cloud[1][0].geometry.vertices[p].x) < (w*scalar)/(2*trade.priceSpace.length)) {
                    //clear previous background and value
                    tracker.context.clearRect(0,0,canvasW*0.75,canvasH);
                    //new background
                    tracker.context.fillStyle = 'rgba(100,100,100,0.5)';
                    tracker.context.fillRect(0,0,canvasW*0.75,canvasH);
                    //new value
                    tracker.context.fillStyle = 'rgb(25,255,25)';
                    tracker.context.fillText(Object.keys(dataArr[dataNum-1][0])[p], canvasW/2*0.75, canvasH/2);
                    //update texture
                    tracker.texture.needsUpdate = true;

                    //update 'output-data-tracker' values
                    [["current-end-val", +elem.select("output-time-field").value],["expiry-mid-val", 0.5],["expiry-end-val", 0]].forEach(function(arr) {
                        var dat = dataArr[dataNum-1][trade.expiryMin-arr[1]];

                        elem.select(arr[0]).innerText = obj.sum(dat[Object.keys(dat)[p]]).toFixed(2);
                    });
                }
            }

            tracker.line.visible = true;
            tracker.mesh.visible = true;
        } else {
            tracker.line.visible = false;
            tracker.mesh.visible = false;

            //clear 'output-data-tracker' values if they exist
            if(elem.select("output-data-tracker").children.length == 6) {
                ["current-end-val","expiry-mid-val","expiry-end-val"].forEach(function(ele) { elem.select(ele).innerText = "-" });
            }
        }
    };

    var setupAndRun = function() {
        //remove load icon, change background color
        elem.destroyChildren("output-data-tracker", ["BSM-load-icon"]);
        elem.select("output-data-tracker").style.backgroundColor = '#333333';
        //remove push text
        elem.destroyChildren("output-view-container", ["BSM-push-text"]);

        self.graphicsInitialized = true;
        //set initial data number
        dataNum = 1;
        setRenderer();
        addGraphComponents();
        addOutputDataTrackerElements();
        self.addClouds();

        //animation
        var render = function() {
            updateTracker();
            renderer.render(scene,camera);
            requestAnimationFrame(render);
        };

        render();

        //enable output data buttons and output time elements
        var enableOutputElems = (function(bool) {
            for(var b=1; b<=9; b++) { elem.avail("output-data-radio-"+b, bool) }
            ["output-time-field","output-time-button"].forEach(function(ele) { elem.avail(ele, bool) });
        }(true));

        //status update
        console.log("type 'trade.' or 'graphics.' in the console to start using either API.");
    };

    var boot = (function() {
        //detect window size change
        window.addEventListener('resize', function onWindowResize() {
            width = elem.select("output-view-container").offsetWidth;
            height = elem.select("output-view-container").offsetHeight;
            renderer.setSize(width,height);
            camera.aspect = width/height;
        });

        //detect user mouse movement
        window.addEventListener('mousemove', function onMouseMove(event) {
            //normalize mouse coordinates with respect to the renderer
            mouse.x = ((event.clientX-renderer.domElement.offsetLeft)/renderer.domElement.width)*2-1;
            mouse.y = -((event.clientY-renderer.domElement.offsetTop)/renderer.domElement.height)*2+1;
        });

        //detect user data change
        var addOutputDataListener = (function() {
            for(var num=1; num<=9; num++) {
                (function(n) {
                    elem.select("output-data-radio-"+n).addEventListener('click', function() {
                        //remove old point clouds
                        scene.remove(cloud[dataNum][0], cloud[dataNum][1], cloud[dataNum][2]);
                        //get new data number
                        dataNum = +elem.select("input[name=output-data-radio]:checked").value;
                        //add new point clouds
                        scene.add(cloud[dataNum][0], cloud[dataNum][1], cloud[dataNum][2]);

                        //change y-axis label values
                        for(var l=0; l<numH; l++) {
                            switch(true) {
                                case l < (numH-1)/2:
                                    labels.yaxis.context[l].clearRect(0,0,canvasW,canvasH);
                                    labels.yaxis.context[l].fillText((range[dataNum]*(1-2*l/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                                    labels.yaxis.texture[l].needsUpdate = true;
                                    break;
                                case l > (numH-1)/2:
                                    labels.yaxis.context[l].clearRect(0,0,canvasW,canvasH);
                                    labels.yaxis.context[l].fillText((-range[dataNum]*(1-2*(numH-1-l)/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                                    labels.yaxis.texture[l].needsUpdate = true;
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                })(num);
            }
        }());

        //detect user time change
        var addOutputTimeListener = (function() {
            elem.select("output-time-button").onclick = function() {
                var val = +elem.select("output-time-field").value;

                switch(false) {
                    //error handling
                    case val != "" && val >= 1 && val <= trade.expiryMin && val == Math.floor(val):
                        errorMsg("output-time-field", "Please enter a whole number between 1 and "+trade.expiryMin+" for the number of calendar days to expiry.");
                        return;
                    default:
                        //update time array value
                        timeArr[2] = val;
                        //update 'output-data-tracker' text
                        elem.select("current-end-text").innerText = val + " DTE - 16:00 EDT :";

                        //update point clouds
                        for(var n=1; n<=9; n++) {
                            //remove old cloud
                            scene.remove(cloud[n][2]);
                            //create new cloud
                            cloud[n][2] = new THREE.Points(new THREE.Geometry(),new THREE.PointsMaterial({size: 0.0035*w*scalar, color: 0x0000ff}));
                            //push new vertices to cloud geometries
                            fillPointClouds(dataArr[n-1][trade.expiryMin-val], n, 2);
                        }
                        break;
                }

                //get new data number
                dataNum = +elem.select("input[name=output-data-radio]:checked").value;
                scene.add(cloud[dataNum][2]);
            }
        }());

        //position camera so that the graphics fill the field of view
        camera.position.set(0,0,h/(2*Math.tan((VFOVdeg*Math.PI/180)/2)));
        scene.add(new THREE.AmbientLight(0xffffff), camera);
    }());

    //*** object API
    self.graphicsLibrary = "Three.js";
    self.graphicsInitialized = false;

    self.initialize = function() {
        if(!self.graphicsInitialized) { initializePointClouds(setupAndRun) } else { console.log("The graphics have already been initialized.") }
    };

    self.addClouds = function() {
        scene.add(cloud[dataNum][0],cloud[dataNum][1],cloud[dataNum][2]);
    };

    self.removeClouds = function() {
        scene.remove(cloud[dataNum][0],cloud[dataNum][1],cloud[dataNum][2]);
    };

    return self;
}());
