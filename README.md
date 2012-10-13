# node-geojson

Convert an array of objects with coordinates/geometry to a [GeoJSON](http://geojson.org/) feature collection. Only works with point data at the moment. 

## Installation

    npm install geojson

## Getting Started

    var GeoJSON = require('geojson');

## Example Usage

Sample Data
    
    var data = [
      {
        name: 'Location A',
        category: 'Store',
        lat: 39.984,
        lng: -75.343
      },
      {
        name: 'Location B',
        category: 'House',
        lat: 39.284,
        lng: -75.833
      },
      {
        name: 'Location C',
        category: 'Office',
        lat: 39.123,
        lng: -74.534
      }
    ];

Specify only coordinate parameters
    
    GeoJSON.parse(data, { point: ['lng', 'lat'] });

      { "type": "FeatureCollection",
        "features": [
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-75.343, 39.984]},
            "properties": { 
              "name": "Location A",
              "category": "Store"
            }
          },
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-75.833, 39.284]},
            "properties": { 
              "name": "Location B",
              "category": "House"
            }
          },
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [ -75.534, 39.123]},
            "properties": { 
              "name": "Location C",
              "category": "Office"
            }
          }
        ]
      }
  
Specify coordinate parameters and `include`
    
    GeoJSON.parse(data, { point: ['lng', 'lat'], include: ['name']});

      { "type": "FeatureCollection",
        "features": [
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-75.343, 39.984]},
            "properties": { 
              "name": "Location A"
            }
          },
          ...
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [ -75.534, 39.123]},
            "properties": { 
              "name": "Location C"
            }
          }
        ]
      }

## Parameters

'point' - array of field names that contain x and y coordinates. Example: `point: [lat, lng]`
'include' - List of fields to include as properties. All other fields will be ignored
'exclude' - List of fields to that shouldn't be included in properties. All other fields will be added (besides geometry fields)