
import mapboxgl from 'mapbox-gl';

export const setupMapLayers = (map: mapboxgl.Map) => {
  // Create a GeoJSON data source
  map.addSource('locations', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // Add cluster layer
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'locations',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        5,
        '#f1f075',
        10,
        '#f28cb1'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        5,
        30,
        10,
        40
      ]
    }
  });

  // Add cluster count text
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'locations',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  });

  // Add unclustered point layer for regular users
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'locations',
    filter: ['all', ['!', ['has', 'point_count']], ['!', ['get', 'is_company']]],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 12,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });
  
  // Add business point layer with different styling
  map.addLayer({
    id: 'business-point',
    type: 'circle',
    source: 'locations',
    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_company'], true]],
    paint: {
      'circle-color': '#f7b733',
      'circle-radius': 14,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });
  
  // Add business icon
  map.addLayer({
    id: 'business-symbol',
    type: 'symbol',
    source: 'locations',
    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_company'], true]],
    layout: {
      'text-field': 'B',
      'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#ffffff'
    }
  });
};
