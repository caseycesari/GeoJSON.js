var GeoJSON = require('./geojson');
var assert = require('assert');

describe('GeoJSON', function() {
  describe('#parse()', function(){
    
    // Sample Data
    var data = [
      {
        name: 'Location A',
        category: 'Store',
        lat: 39.984,
        lng: -75.343,
        street: 'Market'
      },
      {
        name: 'Location B',
        category: 'House',
        lat: 39.284,
        lng: -75.833,
        street: 'Broad'
      },
      {
        name: 'Location C',
        category: 'Office',
        lat: 39.123,
        lng: -74.534,
        street: 'South'
      }
    ];

    var output = GeoJSON.parse(data, {Point: ['lat', 'lng']});

    it('should return output with 3 features', function(){
      assert.equal(output.features.length, 3, 'Output should have 3 features');
    });

    it('should not include geometry fields in feature properties', function(){
      output.features.forEach(function(feature){
        assert.equal(feature.properties.lat, undefined, "Properties shouldn't have lat attribute");
        assert.equal(feature.properties.lng, undefined, "Properties shouldn't have lng attribute");
      });
    });

    it('should include all properties besides geometry attributes when include or exclude isn\'t set', function() {
      output.features.forEach(function(feature){
        assert.notEqual(feature.properties.name, undefined, "Properties should have name attribute");
        assert.notEqual(feature.properties.category, undefined, "Properties should have category attribute");
        assert.notEqual(feature.properties.street, undefined, "Properties should have street attribute");
      });
    });

    it('should only include attributes that are listed in the include parameter', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], include: ['name']});

      output.features.forEach(function(feature){
        assert.equal(feature.properties.category, undefined, "Properites shouldn't have 'category' attribute");
        assert.equal(feature.properties.street, undefined, "Properites shouldn't have 'category' attribute");
      });
    });


    it('should only include attributes that not are listed in the exclude parameter', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], exclude: ['name']});

      output.features.forEach(function(feature){
        assert.equal(feature.properties.name, undefined, "Properites shouldn't have 'name' attribute");
      });
    });

    it('should be able to handle Point geom with x,y stored in one or two attributes', function(){
      var twoAttrs = [{
        name: 'test location',
        y: -74,
        x: 39.0,
        foo: 'bar'
      }];

      var geoTwoAttrs = GeoJSON.parse(twoAttrs, {Point: ['x', 'y']});

      assert.equal(geoTwoAttrs.features[0].geometry.coordinates[0], -74, 'Y value should match input value');
      assert.equal(geoTwoAttrs.features[0].geometry.coordinates[1], 39.0, 'X value should match input value');

      var oneAttr = [{
        name: 'test location',
        coords: [-74, 39],
        foo: 'bar'
      }];

      var geoOneAttr = GeoJSON.parse(oneAttr, {Point: 'coords'});
      
      assert.equal(geoOneAttr.features[0].geometry.coordinates[0], -74, 'Y value should match input value');
      assert.equal(geoOneAttr.features[0].geometry.coordinates[1], 39.0, 'X value should match input value');
    });

    // Based off example spec at http://geojson.org/geojson-spec.html
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

    it('should be able to handle data with different geometry types', function(){
      var output = GeoJSON.parse(data2, {'Point': ['x', 'y'], 'LineString': 'line', 'Polygon': 'polygon'});

      assert.equal(output.features.length, 3, 'Output should have 3 features');

      output.features.forEach(function(feature){
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

    it('should use the default settings when they have been specified', function(){
      GeoJSON.defaults = {
        Point: ['lat', 'lng'],
        include: ['name']
      };

      var output = GeoJSON.parse(data);

      output.features.forEach(function(feature){
        assert.notEqual(feature.properties.name, undefined, "Properties should have name attribute");
        assert.equal(feature.properties.lat, undefined, "Properties shouldn't have lat attribute");
        assert.equal(feature.properties.lng, undefined, "Properties shouldn't have lng attribute");
        assert.notEqual(feature.geometry.coordinates[0], undefined, "geometry.coordinates should have Y value");
        assert.notEqual(feature.geometry.coordinates[1], undefined, "geometry.coordinates should have X value");
      });

      it('should only apply default settings that haven\'t been set in params', function(){
        var output = GeoJSON.parse(data, {include: ['category', 'street']});

        output.features.forEach(function(feature){
          assert.equal(feature.properties.name, undefined, "Properties shouldn't have name attribute");
          assert.notEqual(feature.properties.category, undefined, "Properties should have category attribute");
          assert.notEqual(feature.properties.street, undefined, "Properties should have street attribute");
        });
      });

      it('shouldn\'t be affected from prior calls to parse that set params', function(){
        var output = GeoJSON.parse(data);

        output.features.forEach(function(feature){
          assert.notEqual(feature.properties.name, undefined, "Properties should have name attribute");
          assert.equal(feature.properties.lat, undefined, "Properties shouldn't have lat attribute");
          assert.equal(feature.properties.lng, undefined, "Properties shouldn't have lng attribute");
          assert.notEqual(feature.geometry.coordinates[0], undefined, "geometry.coordinates should have Y value");
          assert.notEqual(feature.geometry.coordinates[1], undefined, "geometry.coordinates should have X value");
        });
      });
    });

  });
});