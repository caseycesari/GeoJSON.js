# node-geojson

Convert an array of objects with geometry to a [GeoJSON](http://geojson.org/) feature collection.

## Installation

    npm install geojson

## Getting Started

    var GeoJSON = require('geojson');

## Example Usage

The library has one method--`parse`.

Take the example data below:
    
    var data = [
      {
        name: 'Location A',
        category: 'Store',
        street: 'Market',
        lat: 39.984,
        lng: -75.343
      },
      {
        name: 'Location B',
        category: 'House',
        street: 'Broad',
        lat: 39.284,
        lng: -75.833
      },
      {
        name: 'Location C',
        category: 'Office',
        street: 'South'
        lat: 39.123,
        lng: -74.534
      }
    ];

Convert it to GeoJSON:
    
    GeoJSON.parse(data, {Point: ['lat', 'lng']});

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
  
Convert the example data to GeoJSON, and only include the `name` attribute in `properties` for each feature.
    
    GeoJSON.parse(data, {Point: ['lat', 'lng'], include: ['name']});

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

The `parse` method can handle data with different geometry types

    var data2 = [
      { 
        x: 0.5,
        y: 102.0,
        prop0: 'value0'
      },
      {
        line: [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]],
        prop0: 'value0',
        prop1: 0.0
      },
      {
        polygon: [
          [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
        ],
        prop0: 'value0',
        prop1: {"this": "that"}
      }
    ];

For each geometry type, specify which attribute contains the geometric data

    GeoJSON.parse(data2, {'Point': ['x', 'y'], 'LineString': 'line', 'Polygon': 'polygon'});

    {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [102,0.5]
          },
          "properties": {
            "prop0": "value0"
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [[102, 0], [103, 1], [104, 0],[105, 1]]
          },
          "properties": {
            "prop0": "value0",
            "prop1": 0
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[100, 0], [101, 0], [101, 1], [100, 1], [100, 0]]]
          },
          "properties": {
            "prop0": "value0",
            "prop1": {
                "this": "that"
              }
          }
        }
      ]
    }

## Parameters

Depending on which makes more sense for your data, you either specify an array of attributes to include or exclude in `properties` for each feature. If neither `include` nor `exclude` is set, all the attributes (besides the attributes containing the geometry data) will be added to `properties`.

- `include` - Array of attributes to included in `properties` objects. All other fields will be ignored.
- `exclude` - Array of attributes to that shouldn't be included in `properties` object. All other fields will be added (besides geometry fields)

The geometry parameters specify which attribute(s) contain(s) the geographic/geometric data. A geometry parameter must be specified for each type of geometry object that is present in your data. For example, if your data contains both points and polygons, you must specify both the `Point` and `Polygon` parameters. **Note that geometry parameters must be in proper case.** See the [GeoJSON spec](http://geojson.org/geojson-spec.html) for details on each geometry type. The structure of the geometry parameter is:

    ParameterName: 'attributeName'

Except for `Point`, which can be specified with a field name or an array of field names, i.e:

    data = [{
      name: 'location',
      x: 34,
      y: 85
    }];

    GeoJSON.parse(data, {Point: ['lat', 'lng']});

    data = [{
      name: 'location',
      coords: [y, x]
    }];

    GeoJSON.parse(data, {Point: 'coords'});

The valid geometry types are `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, and `MultiPolygon`.