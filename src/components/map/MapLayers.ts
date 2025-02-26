
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

  // Add clusters layer with Instagram-like styling
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'locations',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'case',
        ['to-boolean', ['get', 'has_hot_deal']],
        '#E1306C', // Instagram pink for clusters with hot deals
        '#FFFFFF' // White for regular clusters
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        10, 30,
        20, 40
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': [
        'case',
        ['to-boolean', ['get', 'has_hot_deal']],
        '#C13584', // Instagram gradient darker pink
        '#EFEFEF' // Light gray stroke
      ],
      'circle-opacity': 0.9
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
      'text-color': [
        'case',
        ['to-boolean', ['get', 'has_hot_deal']],
        '#FFFFFF', // White text for hot deal clusters
        '#262626'  // Instagram dark gray text for regular clusters
      ]
    }
  });

  // Add unclustered point layer with Instagram-style markers
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'locations',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'is_company'], true],
        [
          'case',
          ['to-boolean', ['get', 'has_hot_deal']],
          '#E1306C', // Instagram pink for company with hot deals
          '#FCAF45'  // Instagram orange/gold for regular companies
        ],
        '#FFFFFF'    // White for regular users
      ],
      'circle-radius': 18,
      'circle-stroke-width': 2,
      'circle-stroke-color': [
        'case',
        ['==', ['get', 'is_company'], true],
        [
          'case',
          ['to-boolean', ['get', 'has_hot_deal']],
          '#C13584',  // Instagram gradient darker pink
          '#F77737'   // Instagram darker orange
        ],
        '#EFEFEF'     // Light gray stroke for regular users
      ],
      'circle-opacity': 0.9
    }
  });

  // Pulsing effect for hot deals
  map.addLayer({
    id: 'hot-deal-pulse',
    type: 'circle',
    source: 'locations',
    filter: [
      'all',
      ['!', ['has', 'point_count']],
      ['to-boolean', ['get', 'has_hot_deal']]
    ],
    paint: {
      'circle-radius': 24,
      'circle-color': '#E1306C',
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['%', ['*', ['time'], 0.001], 1.0],
        0, 0.3,
        0.5, 0.15,
        1, 0.3
      ],
      'circle-stroke-width': 0
    }
  });

  // Add unclustered point count/icon
  map.addLayer({
    id: 'unclustered-point-count',
    type: 'symbol',
    source: 'locations',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': [
        'case',
        ['==', ['get', 'is_company'], true],
        'C',
        '1'
      ],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': [
        'case',
        ['==', ['get', 'is_company'], true],
        [
          'case',
          ['to-boolean', ['get', 'has_hot_deal']],
          '#FFFFFF', // White text for hot deal companies
          '#FFFFFF'  // White text for regular companies
        ],
        '#262626'    // Instagram dark gray for regular users
      ]
    }
  });

  // Add treasures source
  map.addSource('treasures', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // Add treasure marker layer
  map.addLayer({
    id: 'treasures-markers',
    type: 'circle',
    source: 'treasures',
    paint: {
      'circle-color': [
        'case',
        ['to-boolean', ['get', 'is_found']],
        '#8B4513',  // Brown for found treasures
        '#FFD700'   // Gold for unfound treasures
      ],
      'circle-radius': 15,
      'circle-stroke-width': 2,
      'circle-stroke-color': [
        'case',
        ['to-boolean', ['get', 'is_found']],
        '#A52A2A',  // Darker brown for found treasures
        '#FFA500'   // Orange for unfound treasures
      ]
    }
  });

  // Add treasure glow effect
  map.addLayer({
    id: 'treasure-glow',
    type: 'circle',
    source: 'treasures',
    filter: ['!', ['to-boolean', ['get', 'is_found']]],
    paint: {
      'circle-radius': 25,
      'circle-color': '#FFD700',
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['%', ['*', ['time'], 0.001], 1.0],
        0, 0.3,
        0.5, 0.1,
        1, 0.3
      ],
      'circle-stroke-width': 0
    }
  });

  // Add treasure symbols
  map.addLayer({
    id: 'treasure-symbols',
    type: 'symbol',
    source: 'treasures',
    layout: {
      'text-field': '💰',
      'text-size': 12,
      'text-allow-overlap': true,
      'text-ignore-placement': true
    }
  });
};
