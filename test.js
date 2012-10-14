var GeoJSON = require('./geojson');
var assert = require('assert');

describe('GeoJSON', function() {
  describe('#parse()', function(){
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
        street: 'South',
        lat: 39.123,
        lng: -74.534
      }
    ];

    var output1 = GeoJSON.parse(data, {Point: ['lng', 'lat']});

    it('should return output with 3 features', function(){
      assert.equal(output1.features.length, 3, 'Output should have 3 features');
    });

    it('should not include coords/geom fields in feature properties', function(){
      assert.equal(output1.features[0].properties.lat, undefined, "Properties shoudn't have lat field");
      assert.equal(output1.features[0].properties.lng, undefined, "Properties shoudn't have lng field");
    });

    it('should include all properties besides coords/geom fields when include or exclude isn\'t set', function() {
      assert.notEqual(output1.features[0].properties.name, undefined, "Properties should have name field");
      assert.notEqual(output1.features[0].properties.category, undefined, "Properties should have category field");
    });

    var output2 = GeoJSON.parse(data, {Point: ['lng', 'lat'], include: ['name']});

    it('should only include attributes that are listed in the include parameter', function(){
      assert.equal(output2.features[0].properties.category, undefined, "Properites shouldn't have 'category' attribute");
      assert.equal(output2.features[1].properties.street, undefined, "Properites shouldn't have 'category' attribute");
    });

    var output3 = GeoJSON.parse(data, {Point: ['lng', 'lat'], exclude: ['name']});

    it('should only include attributes that not are listed in the exclude parameter', function(){
      assert.equal(output3.features[0].properties.name, undefined, "Properites shouldn't have 'name' attribute");
    });

    // Based off example spec at http://geojson.org/geojson-spec.html
    var data2 = [
      { x: 0.5,
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

    var output4 = GeoJSON.parse(data2, {'Point': ['x', 'y'], 'LineString': 'line', 'Polygon': 'polygon'});

    it('should be able to handle data with different geometry types', function(){
      assert.equal(output4.features.length, 3, 'Output should have 3 features');

      output4.features.forEach(function(feature){
        if(feature.geometry.type === 'Point') {
          assert.equal(feature.geometry.coordinates[1], 0.5, 'y coordinate should match input');
          assert.equal(feature.geometry.coordinates[0], 102, 'y coordinate should match input');
          assert.equal(feature.properties.prop0, "value0", 'Property prop0 should match input value of value0');
        } else if (feature.geometry.type === 'LineString') {
          assert.equal(feature.geometry.coordinates.length, 4, 'Output should have same number of points as input');
          assert.equal(feature.geometry.coordinates[0][1], 0, 'First y coordinate should match input');
          assert.equal(feature.geometry.coordinates[0][0], 102, 'First x coordinate should match input');
          assert.equal(feature.geometry.coordinates[3][1], 1, 'Last y coordinate should match input');
          assert.equal(feature.geometry.coordinates[3][0], 105, 'Last x coordinate should match input');
          assert.equal(feature.properties.prop0, "value0", 'Property prop0 should match input value of value0');
          assert.equal(feature.properties.prop1, 0, 'Property prop1 should match input value of 0');
        } else if (feature.geometry.type === 'Polygon') {
          assert.equal(feature.geometry.coordinates[0].length, 5, 'Output should have same number of points as input');
          assert.equal(feature.geometry.coordinates[0][0][1], 0, 'First y coordinate should match input');
          assert.equal(feature.geometry.coordinates[0][0][0], 100, 'First x coordinate should match input');
          assert.equal(feature.geometry.coordinates[0][4][1], 0, 'Last y coordinate should match input');
          assert.equal(feature.geometry.coordinates[0][4][0], 100, 'Last x coordinate should match input');
          assert.equal(feature.properties.prop0, "value0", 'Property prop0 should match input value of value0');
          assert.equal(feature.properties.prop1['this'], 'that', 'Property prop1.this should match input value of that');
        }
      });
    });

  });
});