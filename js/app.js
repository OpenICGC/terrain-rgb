var static;
var map;
var styleTerrain = {};
styleTerrain.exaggeration = 1.0;
styleTerrain.highlight = "#ecebc0";
styleTerrain.shadow = "#474836";
styleTerrain.accent = "#8a0000";
styleTerrain.illumination = 315;
styleTerrain.background = "#d3e0d3";

//function init() {
$(document).ready(function () {

    map = new mapboxgl.Map({
        container: 'map',
        minZoom: 2,
        maxZoom: 18,
        hash: true,
        style: 'https://geoserveis.icgc.cat/contextmaps/icgc.json',
        center: [1.88979, 41.69589],
        zoom: 13.61,
        attributionControl: false
    });



    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.AttributionControl({
        compact: true
    }));


    //  map.dragRotate.disable();
    // map.touchZoomRotate.disableRotation();

    map.on('load', function () {


        map.addSource("catPol", {
            "type": "vector",
            "url": "https://tilemaps.icgc.cat/tileserver/catpol_tilejson.json",
            "maxzoom": 14
        });
        map.addSource("terrainMapZen", {
            "type": "raster-dem",
            "tiles": [
                "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
            ],
            "tileSize": 256,
            "encoding": "terrarium",
            "maxzoom": 16
        });
        map.addSource("dem", {
            "type": "raster-dem",
            "tiles": ["https://tilemaps.icgc.cat/tileserver/tileserver.php/terreny_icgc_2m_rgb/{z}/{x}/{y}.png"],
            "tileSize": 512,
            "maxzoom": 16,
            "minZoom": 7.5,
        });

        map.addLayer({
            "id": "hillshading2",
            "source": "terrainMapZen",
            "type": "hillshade",
            "maxzoom": 13.5,
            "layout": { "visibility": "none" },
            "paint": {
                "hillshade-illumination-direction": styleTerrain.illumination,
                "hillshade-exaggeration": styleTerrain.exaggeration,
                "hillshade-shadow-color": styleTerrain.shadow,
                "hillshade-highlight-color": styleTerrain.highlight,
                "hillshade-accent-color": styleTerrain.accent,
                "hillshade-illumination-anchor": "map"
            }
        }, "landcover-glacier");


        map.addLayer({
            "id": "hillshading",
            "source": "dem",
            "type": "hillshade",
            "maxzoom": 18,
            "paint": {
                "hillshade-illumination-direction": styleTerrain.illumination,
                "hillshade-exaggeration": styleTerrain.exaggeration,
                "hillshade-shadow-color": styleTerrain.shadow,
                "hillshade-highlight-color": styleTerrain.highlight,
                "hillshade-accent-color": styleTerrain.accent,
                "hillshade-illumination-anchor": "map"
            }
        }, "landcover-glacier");

        map.addLayer({
            "id": "catpol4326",
            "source": "catPol",
            "source-layer": "catpol4326",
            "type": "fill",
            "maxzoom": 18,
            "paint": {
                "fill-color": styleTerrain.background,
                "fill-opacity": 1

            }
        }, "hillshading");



        map.setPaintProperty('landcover-wood-copy', 'fill-opacity', 0.0);
        map.setPaintProperty('landcover-grass-copy', 'fill-opacity', 0.0);
        map.setPaintProperty('park-copy', 'fill-opacity', 0.0);
        map.setPaintProperty('background', 'background-color', styleTerrain.background);

        //map.showTileBoundaries = true;


        map.on("zoomend", function () {
            if (map.getZoom() < 13) {
                map.setLayoutProperty('hillshading2', 'visibility', "visible");
            }
        });
    });


    static = nipplejs.create({
        zone: document.getElementById('static'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        restJoystick: false,
        restOpacity: 1,
        color: '#0654db',
        colorP: '#f98f04',
        frontPosition: {
            x: -35,
            y: -35
        }
    });


    static.on('start end', function (evt, data) {
        dump(evt.type);
        // debug(data);
    }).on('move', function (evt, data) {
        debug(data);


    }).on('dir:up plain:up dir:left plain:left dir:down ' +
        'plain:down dir:right plain:right',
        function (evt, data) {
            dump(evt.type);
        }
    ).on('pressure', function (evt, data) {
        //  debug({pressure: data});
    });


    initLlocs('#controlbox');
    $("#estilJSON").on("click", function () {
        showEstil();
    });
    $('#bt_capture').on('click', function () {
        $('#md_print').modal({
            show: true
        });
    });

    $('#bt_pitch').on('click', function () {
        var pitch = parseInt(map.getPitch());
        pitch == 60 ? pitch = 0 : pitch = pitch + 30;
        map.easeTo({
            'pitch': pitch
        });

    });
    //}// end init

});

function setShadowColor(picker) {

    document.getElementById("shadowColor").value = '#' + picker.toString();
    map.setPaintProperty('hillshading', 'hillshade-shadow-color', '#' + picker.toString());
    map.setPaintProperty('hillshading2', 'hillshade-shadow-color', '#' + picker.toString());
    styleTerrain.shadow = '#' + picker.toString();
}

function setHighColor(picker) {

    document.getElementById("highColor").value = '#' + picker.toString();
    map.setPaintProperty('hillshading', 'hillshade-highlight-color', '#' + picker.toString());
    map.setPaintProperty('hillshading2', 'hillshade-highlight-color', '#' + picker.toString());
    styleTerrain.highlight = '#' + picker.toString();
}

function setAccentColor(picker) {

    document.getElementById("accentColor").value = '#' + picker.toString();
    map.setPaintProperty('hillshading', 'hillshade-accent-color', '#' + picker.toString());
    map.setPaintProperty('hillshading2', 'hillshade-accent-color', '#' + picker.toString());
    styleTerrain.accent = '#' + picker.toString();
}

function setBackgroundColor(picker) {

    document.getElementById("backgroundColor").value = '#' + picker.toString();
    map.setPaintProperty('background', 'background-color', '#' + picker.toString());
    map.setPaintProperty('catpol4326', 'fill-color', '#' + picker.toString());

    styleTerrain.background = '#' + picker.toString();
}


function showEstil() {

    writeStyle();
    $('.ui.modal').modal('show');

}

function writeStyle() {

    const style = {
        "version": 8,
        "name": "terrainrgb",
        "center": [map.getCenter().lng, map.getCenter().lat],
        "zoom": map.getZoom(),
        "bearing": map.getBearing(),
        "pitch": map.getPitch(),
        "sources": {
            "terrainICGC": {
                "type": "raster-dem",
                "tiles": [
                    "https://tilemaps.icgc.cat/tileserver/tileserver.php/terreny_icgc_2m_rgb/{z}/{x}/{y}.png"
                ],
                "maxzoom": 16,
                "minZoom": 7.5
            },

            "terrainMapZen": {
                "type": "raster-dem",
                "tiles": [
                    "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
                ],
                "tileSize": 256,
                "encoding": "terrarium",
                "maxzoom": 16
            }
        },
        "sprite": "https://tilemaps.icgc.cat/tileserver/sprites/maki",
        "glyphs": "https://tilemaps.icgc.cat/tileserver/glyphs/{fontstack}/{range}.pbf",
        "layers": [
            {
                "id": "background",
                "type": "background",
                "paint": { "background-color": styleTerrain.background }
            },
            {
                "id": "terrainMapZen",
                "type": "hillshade",
                "source": "terrainMapZen",
                "layout": { "visibility": "visible" },
                "paint": {
                    "hillshade-illumination-anchor": "map",
                    "hillshade-exaggeration": styleTerrain.exaggeration,
                    "hillshade-highlight-color": styleTerrain.highlight,
                    "hillshade-shadow-color": styleTerrain.shadow,
                    "hillshade-accent-color": styleTerrain.accent,
                    "hillshade-illumination-direction": styleTerrain.illumination,
                    "hillshade-illumination-anchor": "map"
                },
                "interactive": true
            },
            {
                "id": "terrainICGC",
                "type": "hillshade",
                "source": "terrainICGC",
                "layout": { "visibility": "visible" },
                "paint": {
                    "hillshade-illumination-anchor": "map",
                    "hillshade-exaggeration": styleTerrain.exaggeration,
                    "hillshade-highlight-color": styleTerrain.highlight,
                    "hillshade-shadow-color": styleTerrain.shadow,
                    "hillshade-accent-color": styleTerrain.accent,
                    "hillshade-illumination-direction": styleTerrain.illumination,
                    "hillshade-illumination-anchor": "map"
                },
                "interactive": true
            }
        ]
    }

    $('#estilRGB').text(JSON.stringify(style, null, 2));

}

function debug(debug) {

    let ilu = (parseInt(debug.angle.degree) - 90) * -1;

    ilu = ilu < 0 ? ilu += 360 : ilu;

    const exa = parseFloat(debug.distance / 50);

    if (typeof map.getLayer('hillshading') !== 'undefined') {
        map.setPaintProperty('hillshading', 'hillshade-illumination-direction', parseInt(ilu));
        map.setPaintProperty('hillshading', 'hillshade-exaggeration', exa);
        map.setPaintProperty('hillshading2', 'hillshade-illumination-direction', parseInt(ilu));
        map.setPaintProperty('hillshading2', 'hillshade-exaggeration', exa);
        styleTerrain.illumination = parseInt(ilu);
        styleTerrain.exaggeration = exa;
        document.getElementById('ilu').innerHTML = "<b> " + parseInt(ilu) + "&deg;</b>";
        document.getElementById('exa').innerHTML = "<b> x" + (exa).toFixed(1) + "</b>";

    }


}

function dump(evt) {
    // console.info("evt",evt);
}