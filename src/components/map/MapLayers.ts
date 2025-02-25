
import mapboxgl from 'mapbox-gl';
import { MAP_COLORS } from './types';

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

  // Add unclustered point layer for regular users
  map.addLayer({
    id: 'unclustered-point-regular',
    type: 'circle',
    source: 'locations',
    filter: [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], false]
    ],
    paint: {
      'circle-color': MAP_COLORS.REGULAR_USER,
      'circle-radius': 15,
      'circle-opacity': 0.8
    }
  });

  // Add unclustered point layer for business users
  map.addLayer({
    id: 'unclustered-point-business',
    type: 'circle',
    source: 'locations',
    filter: [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], true]
    ],
    paint: {
      'circle-color': MAP_COLORS.BUSINESS_USER,
      'circle-radius': 15,
      'circle-opacity': 0.8
    }
  });

  // Add unclustered point count for regular users
  map.addLayer({
    id: 'unclustered-point-count-regular',
    type: 'symbol',
    source: 'locations',
    filter: [
      'all',
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

  // Add unclustered point count for business users
  map.addLayer({
    id: 'unclustered-point-count-business',
    type: 'symbol',
    source: 'locations',
    filter: [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'is_company'], true]
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
};
