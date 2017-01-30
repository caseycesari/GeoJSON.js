[![Build Status](https://travis-ci.org/caseycesari/GeoJSON.js.svg?branch=master)](https://travis-ci.org/caseypt/GeoJSON.js)

# GeoJSON.js
Turn your geo data into [GeoJSON](http://geojson.org/).

## Installation

For node, use npm: `$ npm install geojson`

In the browser, include `geojson.min.js`. For example: `<script type="text/javascript" src="js/geojson.min.js"></script>`

## Getting Started

In node, `var GeoJSON = require('geojson');`

In the browser, the library is available at `GeoJSON`.

## Example Usage

The library has one method, `parse`, which takes an array of objects (or a single object) with geometry data as the first parameter, an object consisting of settings for the second parameter, and an optional callback function as the third parameter. If a callback is not specified, the `parse` function returns the GeoJSON output.

Take the example data below:

```javascript
var data = [
  { name: 'Location A', category: 'Store', street: 'Market', lat: 39.984, lng: -75.343 },
  { name: 'Location B', category: 'House', street: 'Broad', lat: 39.284, lng: -75.833 },
  { name: 'Location C', category: 'Office', street: 'South', lat: 39.123, lng: -74.534 }
];
```

Convert it to GeoJSON:

```javascript
GeoJSON.parse(data, {Point: ['lat', 'lng']});

{
  "type": "FeatureCollection",
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
```

Convert the example data to GeoJSON, and only include the `name` attribute in `properties` for each feature.

```javascript
GeoJSON.parse(data, {Point: ['lat', 'lng'], include: ['name']});

{
  "type": "FeatureCollection",
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
```

You can also convert a single object to a GeoJSON feature:

```javascript
var singleobject = { name: 'Location A', category: 'Store', street: 'Market', lat: 39.984, lng: -75.343 }

GeoJSON.parse(singleobject, {Point: ['lat', 'lng']});

  {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-75.343, 39.984]},
    "properties": {
      "name": "Location A",
      "category": "Store"
    }
  }      
```

The `parse` method can handle data with different geometry types. Consider the following sample data:

```javascript
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
```

For each geometry type, specify which attribute contains the geometric data

```javascript
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
```

You can also specify default settings if you will be parsing mutliple datasets with similiar attributes.

```javascript
var data1 = [{ name: 'Location A', street: 'Market', x: 34, y: -75 }];

var data2 = [{ name: 'Location B', date: '11/23/2012', x: 54, y: -98 }];

GeoJSON.defaults = {Point: ['x', 'y'], include: ['name']};

GeoJSON.parse(data1, {});

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-75, 34]
      },
      "properties": {
        "name": "Location A"
      }
    }
  ]
}

GeoJSON.parse(data2, {});

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-98, 54]
      },
      "properties": {
        "name": "Location B"
      }
    }
  ]
}
```

You can specify a callback function as an option third parameter.

```javascript
GeoJSON.parse(data, {Point: ['lat', 'lng']}, function(geojson){
  console.log(JSON.stringify(geojson));
});
```

## Parameters

#### include/exclude

Depending on which makes more sense for the data that is being parsed, either specify an array of attributes to include or exclude in `properties` for each feature. If neither `include` nor `exclude` is set, all the attributes (besides the attributes containing the geometry data) will be added to feature `properties`.

- `include` - Array of attributes to include in `properties` for each feature. All other fields will be ignored.
- `exclude` - Array of attributes that shouldn't be included in feature `properties`. All other attributes will be added (besides geometry attributes)

#### Geometry

The geometry parameters specify which attribute(s) contain(s) the geographic/geometric data. A geometry parameter must be specified for each type of geometry object that is present in the data that is being parsed. For example, if the data contains both points and polygons, specify both the `Point` and `Polygon` parameters. **Note that geometry parameters must be in proper case.** See the [GeoJSON spec](http://geojson.org/geojson-spec.html) for details on each geometry type. The structure of the geometry parameter is:

    ParameterName: 'attributeName'

Except for `Point`, which can be specified with a field name or an array of field names, i.e:

    data = [{ name: 'location', x: 34, y: 85 }];

    GeoJSON.parse(data, {Point: ['lat', 'lng']});

or

    data = [{ name: 'location', coords: [85, 34] }];

    GeoJSON.parse(data, {Point: 'coords'});

The valid geometry types are

- `Point`
- `MultiPoint`
- `LineString`
- `MultiLineString`
- `Polygon`
- `MultiPolygon`

To parse already encoded GeoJSON use

`GeoJSON`

    var data = [{name: 'Location A', geo: {"type": "Point", "coordinates": [125.6, 10.1]}}];

    GeoJSON.parse(data, {GeoJSON: 'geo'});

	"type": "FeatureCollection",
	"features": [{
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [125.6, 10.1]
		},
		"properties": {
			"name": "Location A"
		}
	}]
}

#### bbox, crs

geojson.js also supports the optional GeoJSON properties `bbox` and `crs`.

- `crs` - An object identifying a coordinate reference system. [More information](http://geojson.org/geojson-spec.html#coordinate-reference-system-objects)
- `bbox` - A bounding box for the feature collection. An array with the following format: `[y1, x1, y2, x2]`. [More information](http://geojson.org/geojson-spec.html#bounding-boxes)

#### extra

You can add arbitrary properties to features using the `extra` param. The value for `extra` must be an object. For example, using the original sample data:

    GeoJSON.parse(data, {
      Point: ['lat', 'lng'],
      extra: {
        style: {
          "color": "#ff7800",
          "weight": 5,
          "opacity": 0.65
        }
      }
    });

    {
      "type": "FeatureCollection",
      "features": [
        { "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [-75.343, 39.984]},
          "properties": {
            "name": "Location A",
            "category": "Store",
            "style": {
              "color": "#ff7800",
              "weight": 5,
              "opacity": 0.65
            }
          }
        },
      ...
    }    

#### extraGlobal

You can also add dataset properties using the `extraGlobal` param. The value for `extraGlobal` must be an object.

    GeoJSON.parse(data, {
      Point: ['lat', 'lng'],
      extraGlobal: {
        'Creator': 'Mr. Example',
        'records': data.length,
        'summary': 'A few example points'
      }
    });

      {
        "type": "FeatureCollection",
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
        ],
        "properties": {
          "Creator": "Mr. Example",
          "records": 2,
          "summary": "A few example points"
        }
      }

## Tests

For node, `$ npm test`.

For the browser, visit `test/test.html`.

## Building

`$ grunt ` will run test.js, then lint and minify `geojson.js`.

`$ grunt all` will do all the above, plus run the browser tests, `test.html`. Note that this requires [PhantomJS](http://phantomjs.org/).

## License

Licensed under the MIT License. See `LICENSE` for details.
