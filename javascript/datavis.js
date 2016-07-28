visuals = function(properties) {

    var self = function() { return };

    for(prop in properties) { self[prop] = properties[prop] }

    return self;
}({

    init: function() {

        //remove the loading text
        elem.destroyChildren("output-view-container", ['BSM-loading-text']);

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
            light    = new THREE.AmbientLight(0xffffff),
            mouse    = {x: 0, y: 0};

        //local vars for the 2D view
        var w       = 1,
            h       = 0.4, //container aspect is 2.5:1
            scalar  = 0.925,
            zDist   = -h/(2*Math.tan((VFOVdeg*Math.PI/180)/2)),
            numH    = 25,
            numV    = 7,
            canvasW = 2*Math.floor(width*(1-(1.01)*scalar)), //THE MULTIPLIER FIXES BLURRY TEXT - IS IT RELATED TO THE 'devicePixelRatio' PROPERTY?
            canvasH = 2*Math.floor(height*(0.6)*scalar/(numH-1)), //AND HERE AS WELL
            xPos    = canvasW/2,
            yPos    = canvasH/2,
            data,
            gRange,
            clouds = [];

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


        //GRAPH DATA
        showGraphData = function() {

            //local vars
            switch(+elem.select("input[name=output-data-radio]:checked").value) {

                case 1:
                    data = g.PROFITLOSS_DATA;
                    break;

                case 2:
                    data = g.DELTA_DATA;
                    break;

                case 3:
                    data = g.GAMMA_DATA;
                    break;

                case 4:
                    data = g.THETA_DATA;
                    break;

                case 5:
                    data = g.VEGA_DATA;
                    break;

                case 6:
                    data = g.RHO_DATA;
                    break;
            }

            //global range of the data
            switch(data) {

                case g.GAMMA_DATA:
                /* fall-through */
                case g.THETA_DATA:
                    var r  = obj.range(data[0], data[obj.min(g.EXPIRY)-1]);
                    gRange = r !== 0 ? r : 1;
                    break;

                default:
                    var r  = obj.range(data[0], data[obj.min(g.EXPIRY)]);
                    gRange = r !== 0 ? r : 1;
                    break;
            }

            //point cloud objects
            [ 0x0000ff, 0xff0000 ].forEach(function(col, t) { clouds[t] = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size: 1.75*w*scalar/500, color: col})) });

            //push vertices to the point cloud geometries
            [ data[0], data[obj.min(g.EXPIRY)] ].forEach(function(set, t) {

                //loop variable
                var k=0;

                for(val in set) {

                    clouds[t].geometry.vertices.push(new THREE.Vector3(

                        w*(scalar*(k/(obj.size(data[0])-1)-1)+0.5), //x-coordinate

                        h/2*(scalar*(set[val]/gRange-numH/(numH-1))+1), //y-coordinate

                        zDist+0.00001 //z-coordinate (points placed slightly in front of the grid and background)
                    ));

                    k++;
                }

                //add the point cloud to the scene
                camera.add(clouds[t]);
            });
        }


        //listen for data display change -- IS THERE A WAY TO ADD ONE LISTENER TO ALL RADIO BUTTONS IN A FORM?
        elem.select("output-data-radio-1").addEventListener("click", function() { console.log('click!') });


        //THE 2D VIEW
        show2DView = function() {

            //LOCAL VARS
            var //background
                plane1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({color: 0x888888})),
                plane2 = new THREE.Mesh(new THREE.PlaneGeometry(w*scalar, h*scalar, 1, 1), new THREE.MeshBasicMaterial({color: 0x333333})),

                //gridlines and labels
                lines   = { xaxis: {tick: {}, ext: {}, dots: {}}, yaxis: {} },
                labels  = { xaxis: {canvas: {}, context: {}, texture: {}, mesh: {}}, yaxis: {canvas: {}, context: {}, texture: {}, mesh: {}} };

            //position the background and add it to the scene
            plane1.position.set(0, 0, zDist);
            plane2.position.set(w/2*(1-scalar), h/2*(1-scalar*numH/(numH-1)), zDist);
            camera.add(plane1, plane2);

            //ADD HORIZONTAL GRIDLINES AND VERTICAL AXIS LABELS
            for(i=0; i<numH; i++) {

                //gridlines
                var gridlineGeom = new THREE.Geometry();

                    gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar*2), h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //left vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(w/2*(1-(1.01)*scalar), h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //center vertex
                    gridlineGeom.vertices.push(new THREE.Vector3(w/2, h/2*(1-scalar*(2*i+1)/(numH-1)), zDist)); //right vertex

                lines.yaxis[i] = new THREE.Line(gridlineGeom, new THREE.LineBasicMaterial({color: 0x444444}));

                //labels - create the canvas
                labels.yaxis.canvas[i] = document.createElement('canvas');
                labels.yaxis.canvas[i].width  = canvasW;
                labels.yaxis.canvas[i].height = canvasH;

                //get context, paint the canvas background
                labels.yaxis.context[i] = labels.yaxis.canvas[i].getContext('2d');
                labels.yaxis.context[i].fillStyle = '#888888';
                labels.yaxis.context[i].fillRect(0, 0, canvasW, canvasH);

                //set color, font and alignment for the label text
                labels.yaxis.context[i].fillStyle = 'black';
                labels.yaxis.context[i].font = (canvasH-1)+'px Arial';
                labels.yaxis.context[i].textAlign = 'center';
                labels.yaxis.context[i].textBaseline = 'middle';


                //set color and value of the x-axis as well as all other gridline values
                switch(i) {

                    case (numH-1)/2:
                        lines.yaxis[i].material.color.setHex(0x777777);
                        labels.yaxis.context[i].fillText('0', xPos, yPos);
                        break;

                    //ROUNDING ISSUE HERE, WORTH TRYING TO FIX?
                    default:
                        labels.yaxis.context[i].fillText((gRange*(1-2*i/(numH-1))).toFixed(2), xPos, yPos);
                        break;
                }

                //set canvas as texture and specify texture parameters
                labels.yaxis.texture[i] = new THREE.Texture(labels.yaxis.canvas[i]);
                labels.yaxis.texture[i].minFilter = THREE.LinearFilter; //WHAT DOES THIS ACTUALLY DO?
                labels.yaxis.texture[i].needsUpdate = true; //AND THIS?

                //create label mesh and map canvas texture to it
                labels.yaxis.mesh[i] = new THREE.Mesh(
                                           new THREE.PlaneGeometry(w*(1-(1.01)*scalar), h*(0.6)*scalar/(numH-1), 1, 1),
                                           new THREE.MeshBasicMaterial({map: labels.yaxis.texture[i]})
                                       );

                //set label position
                labels.yaxis.mesh[i].position.set(-w/2*(1.01)*scalar, h/2*(1-scalar*((2*i+1+(0.6)/4)/(numH-1)-(0.002))), zDist);

                //add gridline and label to the scene
                camera.add(lines.yaxis[i], labels.yaxis.mesh[i]);
            }

            //ADD VERTICAL TICK MARKS AND DOTTED LINES, AND HORIZONTAL AXIS LABELS
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

                //labels - create the canvas
                labels.xaxis.canvas[i] = document.createElement('canvas');
                labels.xaxis.canvas[i].width  = canvasW*0.75;
                labels.xaxis.canvas[i].height = canvasH;

                //get context, paint the canvas background
                labels.xaxis.context[i] = labels.xaxis.canvas[i].getContext('2d');
                labels.xaxis.context[i].fillStyle = '#888888';
                labels.xaxis.context[i].fillRect(0, 0, canvasW, canvasH);

                //set color, font and alignment for the label text
                labels.xaxis.context[i].fillStyle = 'black';
                labels.xaxis.context[i].font = (canvasH-1)+'px Arial';
                labels.xaxis.context[i].textAlign = 'center';
                labels.xaxis.context[i].textBaseline = 'middle';

                //set label values from -3 to +3 implied standard deviations
                switch((g.STOCKRANGE_LENGTH-1) % (numV-1)) {

                    case 0:
                        var labelText = '$'+Object.keys(data[0])[(g.STOCKRANGE_LENGTH-1)/(numV-1)*i];
                        break;

                    default:
                        switch(Math.floor((g.STOCKRANGE_LENGTH-1)/(numV-1))) {

                            //the case where the fractional part of the remainder is < 0.5
                            case Math.round((g.STOCKRANGE_LENGTH-1)/(numV-1)):
                                //Thanks to Michael Wunder for his help with this
                                var labelText = '$'+Object.keys(data[0])[Math.floor((g.STOCKRANGE_LENGTH-1)/(numV-1))*i+Math.floor((i+1)/3)];
                                break;

                            //the case where the fractional part of the remainder is >= 0.5
                            default:
                                var labelText = '$'+Object.keys(data[0])[Math.ceil((g.STOCKRANGE_LENGTH-1)/(numV-1))*i-Math.floor((i+1)/3)];
                                break;
                        }
                        break;
                }

                labels.xaxis.context[i].fillText(labelText, xPos*0.75, yPos);

                //set canvas as texture and specify texture parameters
                labels.xaxis.texture[i] = new THREE.Texture(labels.xaxis.canvas[i]);
                labels.xaxis.texture[i].minFilter = THREE.LinearFilter; //WHAT DOES THIS ACTUALLY DO?
                labels.xaxis.texture[i].needsUpdate = true; //AND THIS?

                //create label mesh and map canvas texture to it
                labels.xaxis.mesh[i] = new THREE.Mesh(
                                           new THREE.PlaneGeometry(w*(1-(1.01)*scalar)*0.75, h*(0.6)*scalar/(numH-1), 1, 1),
                                           new THREE.MeshBasicMaterial({map: labels.xaxis.texture[i]})
                                       );

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


        //WRITE IV AND 'GREEKS' INFO/TOTALS TO THE TRADE SUMMARY TABLE
        showTableData = function() {

            for(i=1; i<g.TRADE_LEGS+1; i++) {

                //local loop vars
                var element     = "leg-" + i + "-",
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


        //ANIMATION
        render = function() {

            renderer.render(scene, camera);
            requestAnimationFrame(render);
            //console.log();
        }

        render();
        showGraphData();
        show2DView();
        showTableData();
        //console.log();
    }
})
