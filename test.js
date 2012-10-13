var GeoJSON = require('./geojson');
var assert = require('assert');

describe('GeoJSON', function() {
  describe('#parse()', function(){
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

    var output1 = GeoJSON.parse(data, {point: ['lng', 'lat']});

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

    var output2 = GeoJSON.parse(data, {point: ['lng', 'lat'], include: ['name']});

    it('should only include attributes that are listed in the include parameter', function(){
      assert.equal(output2.features[0].properties.category, undefined, "Properites shouldn't have 'category' attribute");
    });

    var output3 = GeoJSON.parse(data, {point: ['lng', 'lat'], exclude: ['name']});

    it('should only include attributes that not are listed in the exclude parameter', function(){
      assert.equal(output3.features[0].properties.name, undefined, "Properites shouldn't have 'name' attribute");
    });

  });
});