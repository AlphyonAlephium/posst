
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

  // Add different markers for companies and regular users
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], false]
    ],
    paint: {
      'circle-color': '#FFFFFF',
      'circle-radius': 15,
      'circle-opacity': 0.8
    }
  });

  // Company markers (using a different color)
  map.addLayer({
    id: 'company-point',
    type: 'circle',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], true]
    ],
    paint: {
      'circle-color': '#b19cd9', // Light purple for companies
      'circle-radius': 15,
      'circle-opacity': 0.8
    }
  });

  // Add company name labels (only visible when zoomed in)
  map.addLayer({
    id: 'company-name-label',
    type: 'symbol',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], true],
      ['has', 'company_name']
    ],
    layout: {
      'text-field': '{company_name}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'text-offset': [0, -2], // Position above the marker
      'text-anchor': 'bottom',
      // Only show company names when zoomed in (zoom level 10+)
      'text-allow-overlap': false,
      'visibility': 'visible'
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 1.5
    },
    minzoom: 10 // Only display company names when zoomed in close
  });

  // Add unclustered point count for regular users
  map.addLayer({
    id: 'unclustered-point-count',
    type: 'symbol',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], false]
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

  // Add unclustered point count for companies
  map.addLayer({
    id: 'company-point-count',
    type: 'symbol',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], true]
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
