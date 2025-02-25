
import mapboxgl from 'mapbox-gl';

export const setupMapLayers = (map: mapboxgl.Map) => {
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

  // Add clusters layer
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'locations',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#FFFFFF',
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        10, 30,
        20, 40
      ],
      'circle-opacity': 0.8
    }
  });

  // Add cluster count labels
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'locations',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#7ed957'
    }
  });

  // Add business point layer
  map.addLayer({
    id: 'business-point',
    type: 'circle',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']], 
      ['==', ['get', 'is_business'], true]
    ],
    paint: {
      'circle-color': '#7ed957', // Different color for business accounts
      'circle-radius': 15,
      'circle-opacity': 0.8
    }
  });

  // Add business point label (B)
  map.addLayer({
    id: 'business-point-label',
    type: 'symbol',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']], 
      ['==', ['get', 'is_business'], true]
    ],
    layout: {
      'text-field': 'B',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#FFFFFF'
    }
  });

  // Add business name label (only visible when zoomed in)
  map.addLayer({
    id: 'business-name',
    type: 'symbol',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']], 
      ['==', ['get', 'is_business'], true]
    ],
    layout: {
      'text-field': ['get', 'business_name'],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'text-offset': [0, 2], // Position below the point
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      // Only show name when zoomed in
      'visibility': 'visible'
    },
    paint: {
      'text-color': '#333333',
      'text-halo-color': '#FFFFFF',
      'text-halo-width': 1.5
    },
    minzoom: 10 // Only visible when zoomed in
  });

  // Add unclustered regular user point layer
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']], 
      ['!=', ['get', 'is_business'], true]
    ],
    paint: {
      'circle-color': '#FFFFFF',
      'circle-radius': 15,
      'circle-opacity': 0.8
    }
  });

  // Add unclustered regular user point count
  map.addLayer({
    id: 'unclustered-point-count',
    type: 'symbol',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']], 
      ['!=', ['get', 'is_business'], true]
    ],
    layout: {
      'text-field': '1',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#7ed957'
    }
  });
};
