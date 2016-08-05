visuals = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    init: function() {

        //local vars for the 2D and 3D views 
        var width    = elem.select("output-view-container").offsetWidth,
            height   = elem.select("output-view-container").offsetHeight,
            scene    = new THREE.Scene(),
            renderer = new THREE.WebGLRenderer({antialias: false, alpha: true}),
            VFOVdeg  = 45,
            aspect   = width/height,
            near     = 0.1,
            far      = 100,
            camera   = new THREE.PerspectiveCamera(VFOVdeg, aspect, near, far),
            phi      = 0,
            theta    = 0,
            radius   = 0,
            light    = new THREE.AmbientLight(0xffffff);

        //local vars for the 2D view
        var w       = 1,
            h       = 0.4, //container aspect is 2.5:1
            scalar  = 0.925,
            zDist   = -h/(2*Math.tan((VFOVdeg*Math.PI/180)/2)),
            numH    = 25,
            numV    = 7,
            canvasW = 2*Math.floor(width*(1-(1.01)*scalar)), //THE MULTIPLIER FIXES BLURRY TEXT - IS IT RELATED TO THE 'devicePixelRatio' PROPERTY?
            canvasH = 2*Math.floor(height*(0.6)*scalar/(numH-1)), //AND HERE AS WELL
            data,
            index,
            range,
            clouds  = {},
            labels  = { xaxis: {canvas: {}, context: {}, texture: {}, mesh: {}}, yaxis: {canvas: {}, context: {}, texture: {}, mesh: {}} };

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

        //set camera position and add light, camera to the scene
        camera.position.set(radius*Math.sin(phi)*Math.cos(theta), radius*Math.sin(phi)*Math.sin(theta), radius*Math.cos(phi));
        scene.add(light, camera);

        // HELPERS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //ANIMATION
        render = function() {

            renderer.render(scene, camera);
            requestAnimationFrame(render);
            //console.log();
        }


        //THE 2D VIEW
        add2DGraphObjects = function() {

            //local vars for the background and gridlines
            var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({color: 0x888888})),
                plane2 = new THREE.Mesh(new THREE.PlaneGeometry(w*scalar, h*scalar, 1, 1), new THREE.MeshBasicMaterial({color: 0x333333})),
                lines  = { xaxis: {tick: {}, ext: {}, dots: {}}, yaxis: {} };


            //label canvases, contexts, etc.
            addLabelCanvases = function(axis, n) {

                var p = axis == 'yaxis' ? 1: 0.75;

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

            //label textures, meshes, etc.
            addLabelMeshes = function(axis, n) {

                var p = axis == 'yaxis' ? 1 : 0.75;

                //set canvas as texture and specify texture parameters
                labels[axis].texture[n]             = new THREE.Texture(labels[axis].canvas[n]);
                labels[axis].texture[n].minFilter   = THREE.LinearFilter; //WHAT DOES THIS ACTUALLY DO?
                labels[axis].texture[n].needsUpdate = true;

                //create label mesh and map canvas texture to it
                labels[axis].mesh[n] = new THREE.Mesh(
                                           new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*p, h*(0.6)*scalar/(numH-1), 1, 1),
                                           new THREE.MeshBasicMaterial({map: labels[axis].texture[n]})
                                       );
            }

            //position the background and add it to the scene
            plane1.position.set(0, 0, zDist);
            plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numH/(numH-1)), zDist);
            camera.add(plane1, plane2);

            //add horizontal gridlines and vertical axis labels
            for(i=0; i<numH; i++) {

                //gridlines
                var gridlineGeom = new THREE.Geometry();

                    gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar*2), h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //left vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar), h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //center vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(w/2, h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //right vertex

                lines.yaxis[i] = new THREE.Line(gridlineGeom, new THREE.LineBasicMaterial({color: 0x444444}));

                addLabelCanvases('yaxis', i);

                //set color of and value at the x-axis as well as all other values
                switch(i) {

                    case (numH-1)/2:
                        lines.yaxis[i].material.color.setHex(0x777777);
                        labels.yaxis.context[i].fillText('0', canvasW/2, canvasH/2);
                        break;

                    //ROUNDING ISSUE HERE, WORTH TRYING TO FIX?
                    default:
                        labels.yaxis.context[i].fillText((range*(1-2*i/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                        break;
                }

                addLabelMeshes('yaxis', i);

                //set label position
                labels.yaxis.mesh[i].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*i+1+(0.6)/4)/(numH-1)-(0.002))), zDist);

                //add gridline and label to the scene
                camera.add(lines.yaxis[i], labels.yaxis.mesh[i]);
            }


            //add vertical tick marks and dotted lines as well as horizontal axis labels
            for(i=0; i<numV; i++) {

                //tick marks
                var tickGeom = new THREE.Geometry();

                tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*2), zDist)); //top vertex
                tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*(2*numH-1)/(numH-1)), zDist)); //center vertex
                tickGeom.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //bottom vertex

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

                    lines.xaxis.dots[i].geometry.vertices.push(new THREE.Vector3(w*(scalar*(i/6-1)+0.5), h*(scalar*(0.25*(j+1)/(numH-1)-1)+0.5), zDist));
                }

                addLabelCanvases('xaxis', i);

                //set label values from -3 to +3 implied standard deviations
                switch((g.STOCKRANGE_LENGTH-1) % (numV-1)) {

                    case 0:
                        var labelText = '$'+Object.keys(g.PROFITLOSS_DATA[0])[(g.STOCKRANGE_LENGTH-1)/(numV-1)*i];
                        break;

                    default:
                        switch(Math.floor((g.STOCKRANGE_LENGTH-1)/(numV-1))) {

                            //the case where the fractional part of the remainder is < 0.5
                            case Math.round((g.STOCKRANGE_LENGTH-1)/(numV-1)):
                                //Thanks to Michael Wunder for his help with this
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

                addLabelMeshes('xaxis', i);

                //set label position; at book-ends: bump in label and extend tick mark
                switch(i) {

                    case 0:
                        //bump label right
                        labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1-1.01*0.375)+0.375+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), zDist);

                        //extend tick mark right
                        var extGeom = new THREE.Geometry();

                        extGeom.vertices.push(new THREE.Vector3(w*(-scalar+0.5), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //left vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.25*(-scalar*(1.01*0.75+4)+0.75+2), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //center vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.5*(-scalar*(1.01*0.75+2)+0.75+1), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //right vertex

                        lines.xaxis.ext[i] = new THREE.Line(extGeom, new THREE.LineBasicMaterial({color: 0xffff00}));
                        camera.add(lines.xaxis.ext[i]);
                        break;

                    case 6:
                        //bump label left
                        labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1+1.01*0.375)-0.375+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), zDist);

                        //extend tick mark left
                        var extGeom = new THREE.Geometry();

                        extGeom.vertices.push(new THREE.Vector3(w*0.5*(0.75*(scalar*1.01-1)+1), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //left vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.25*(0.75*(scalar*1.01-1)+2), h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //center vertex
                        extGeom.vertices.push(new THREE.Vector3(w*0.5, h/2*(1-scalar*(2*numH)/(numH-1)), zDist)); //right vertex

                        lines.xaxis.ext[i] = new THREE.Line(extGeom, new THREE.LineBasicMaterial({color: 0xffff00}));
                        camera.add(lines.xaxis.ext[i]);
                        break;

                    default:
                        labels.xaxis.mesh[i].position.set(w*(scalar*(i/6-1)+0.5), h*(scalar/(1-numH)*(numH+0.45)+0.5), zDist);
                        break;
                }

                //add tick marks, dotted lines and labels to the scene
                camera.add(lines.xaxis.tick[i], lines.xaxis.dots[i], labels.xaxis.mesh[i]);
            }
        }


        //GRAPH DATA
        getGraphInfo = function(type) {

            switch(type) {

                case 'data':
                    var value = +elem.select("input[name=output-data-radio]:checked").value;

                    switch(value) {

                        case 0:
                            return g.PROFITLOSS_DATA;
                        case 1:
                            return g.DELTA_DATA;
                        case 2:
                            return g.GAMMA_DATA;
                        case 3:
                            return g.THETA_DATA;
                        case 4:
                            return g.VEGA_DATA;
                        case 5:
                            return g.RHO_DATA;
                    }

                case 'index':
                    switch(data) {

                        case g.PROFITLOSS_DATA:
                            return 0;
                        case g.DELTA_DATA:
                            return 1;
                        case g.GAMMA_DATA:
                            return 2;
                        case g.THETA_DATA:
                            return 3;
                        case g.VEGA_DATA:
                            return 4;
                        case g.RHO_DATA:
                            return 5;
                    }
            }
        }


        //ADD OR REMOVE GRAPH DATA
        graph = function(type) {

            index = getGraphInfo('index');

            switch(type) {

                case 'add':
                    camera.add(clouds[index][0], clouds[index][1], clouds[index][2]);
                    break;

                case 'remove':
                    camera.remove(clouds[index][0], clouds[index][1], clouds[index][2]);
                    break;
            }
        }


        //DATA RANGE
        getDataRange = function(data) {

            switch(data) {

                case g.GAMMA_DATA:
                /* fall-through */
                case g.THETA_DATA:
                    var r  = obj.range(data[0], data[obj.min(g.EXPIRY)-0.5]);
                    range  = r !== 0 ? r : 1;
                    break;

                default:
                    var r  = obj.range(data[0], data[obj.min(g.EXPIRY)]);
                    range  = r !== 0 ? r : 1;
                    break;
            }
        }


        //LISTEN FOR GRAPH DATA DISPLAY CHANGE
        addGraphDataChangeListener = function() {

            for(i=1; i<7; i++) {

                (function(n) {

                    elem.select("output-data-radio-"+n).addEventListener('click', function() {

                        //remove the old point clouds
                        graph('remove');

                        //add the new ones
                        data = getGraphInfo('data');
                        getDataRange(data);

                        graph('add');

                        //change y-axis label values
                        for(j=0; j<numH; j++) { 

                            //clear the old labels
                            labels.yaxis.context[j].clearRect(0, 0, canvasW, canvasH);

                            //set value at the x-axis as well as all other values
                            switch(j) {

                                case (numH-1)/2:
                                    labels.yaxis.context[j].fillText('0', canvasW/2, canvasH/2);
                                    break;

                                //ROUNDING ISSUE HERE, WORTH TRYING TO FIX?
                                default:
                                    labels.yaxis.context[j].fillText((range*(1-2*j/(numH-1))).toFixed(2), canvasW/2, canvasH/2);
                                    break;
                            }

                            //update the texture
                            labels.yaxis.texture[j].needsUpdate = true;
                        }
                    });
                })(i);
            }
        }


        //WRITE IV AND 'GREEKS' INFO/TOTALS TO THE TRADE SUMMARY TABLE
        addTableData = function() {

            for(i=1; i<g.TRADE_LEGS+1; i++) {

                //local loop vars
                var element     = "leg-"+i+"-",
                    greeksArray = ['delta','gamma','theta','vega','rho']; 

                //IV
                elem.select(element+"iv").innerHTML = (g.IMPLIED_VOL[i]*Math.pow(10,2)).toFixed(2) + "%";
                elem.select(element+"iv").style.color = g.LONG_SHORT[i] == 1 ? "rgb(0,175,0)" : "rgb(200,0,0)";
                elem.select(element+"iv").style.borderRightColor = "rgb(0,0,0)";

                //'greeks'
                greeksArray.forEach(function(greek) { elem.select(element+greek).innerHTML = g[greek.toUpperCase()][i].toFixed(2) });
            }

            //'greeks' totals
            greeksArray.forEach(function(greek) { elem.select(greek+"-total").innerHTML = obj.sum(g[greek.toUpperCase()]).toFixed(2) });
        }

        // END HELPERS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // MAIN /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //PUSH 2D DATA TO POINT CLOUDS
        push2DData = function(callback) {

            //local vars
            var colors = [0xff0000, 0xaa00ff, 0x0000ff];

            //all data
            [g.PROFITLOSS_DATA, g.DELTA_DATA, g.GAMMA_DATA, g.THETA_DATA, g.VEGA_DATA, g.RHO_DATA].forEach(function(num, n) {

                getDataRange(num);

                //declare objects to hold the point clouds
                clouds[n] = {};

                //point clouds
                [num[30], num[29.5], num[0]].forEach(function(set, tau) {

                    //create objects
                    clouds[n][tau] = new THREE.Points( new THREE.Geometry(), new THREE.PointsMaterial({ size: 0.0035*w*scalar, color: colors[tau] }) );

                    //push vertices to the point cloud geometries
                    for(val in set) {

                        clouds[n][tau].geometry.vertices.push(new THREE.Vector3(

                            w*(scalar*(Object.keys(set).indexOf(val)/(obj.size(set)-1)-1)+0.5), //x-coordinate

                            h/2*(scalar*(set[val]/range-numH/(numH-1))+1), //y-coordinate

                            zDist+0.00001 //z-coordinate
                        ));
                    }
                });
            });

            callback = function() {

                //status message
                console.log('point clouds full.');

                //remove 'pushing data' text
                elem.destroyChildren("output-view-container", ["BSM-push-text"]);

                //display the global object in the console
                console.log(g);

                data = getGraphInfo('data');
                getDataRange(data);

                render();
                add2DGraphObjects();
                graph('add');
                addGraphDataChangeListener();
            }();
        }

        // END MAIN /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        addTableData();
        setTimeout(function() { push2DData() }, 100);

        //console.log();
    }
})
