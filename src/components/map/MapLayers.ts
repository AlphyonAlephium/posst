
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

  // Add unclustered point layer
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'locations',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'is_company'], true], '#4287f5',
        ['==', ['get', 'has_active_deal'], true], '#ff0000',
        '#FFFFFF'
      ],
      'circle-radius': 15,
      'circle-opacity': 0.8,
      'circle-stroke-width': [
        'case',
        ['==', ['get', 'has_active_deal'], true], 2,
        0
      ],
      'circle-stroke-color': '#ff0000',
      'circle-stroke-opacity': 0.8
    }
  });

  // Add glowing effect for points with active deals
  map.addLayer({
    id: 'active-deal-glow',
    type: 'circle',
    source: 'locations',
    filter: ['all', 
      ['!', ['has', 'point_count']], 
      ['==', ['get', 'has_active_deal'], true]
    ],
    paint: {
      'circle-radius': 25,
      'circle-color': '#ff0000',
      'circle-opacity': 0.3,
      'circle-blur': 1
    }
  });

  // Add unclustered point count
  map.addLayer({
    id: 'unclustered-point-count',
    type: 'symbol',
    source: 'locations',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': '1',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#7ed957'
    }
  });

  // Add company names for companies
  map.addLayer({
    id: 'company-names',
    type: 'symbol',
    source: 'locations',
    filter: ['all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], true]
    ],
    layout: {
      'text-field': ['get', 'company_name'],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
      'text-offset': [0, -2]
    },
    paint: {
      'text-color': '#000000',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1
    }
  });
};
