if (typeof window === 'undefined') {
  var expect = require('expect.js');
  var GeoJSON = require('../geojson');
}

describe('GeoJSON', function() {

  describe('#defaults', function(){
    it('exists as a public object of GeoJSON', function(){
      expect(typeof GeoJSON.defaults).to.eql('object');
    });

    it('is initially empty', function() {
      var count = 0;
      for(var key in GeoJSON.defaults) {
        if(GeoJSON.defaults.hasOwnProperty(key)) {
          count++;
        }
      }

      expect(count).to.be(0);
    });
  });

  describe('#parse', function(){
    var data;

    before(function() {
      // Sample Data
      data = [
        { name: 'Location A', category: 'Store', lat: 39.984, lng: -75.343, street: 'Market' },
        { name: 'Location B', category: 'House', lat: 39.284, lng: -75.833, street: 'Broad' },
        { name: 'Location C', category: 'Office', lat: 39.123, lng: -74.534, street: 'South' }
      ];
    });

    it('returns output with the same number of features as the input', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng']});

      expect(output.features.length).to.be(3);
    });

    it('doesn\'t include geometry fields in feature properties', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng']});

      output.features.forEach(function(feature){
        expect(feature.properties.lat).to.not.be.ok();
        expect(feature.properties.lng).to.not.be.ok();
        expect(feature.geometry.coordinates[0]).to.be.ok();
        expect(feature.geometry.coordinates[1]).to.be.ok();
      });
    });

    it('includes all properties besides geometry attributes when include or exclude isn\'t set', function() {
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng']});

      output.features.forEach(function(feature){
        expect(feature.properties.name).to.be.ok();
        expect(feature.properties.category).to.be.ok();
        expect(feature.properties.street).to.be.ok();
      });
    });

    it('only includes attributes that are listed in the include parameter', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], include: ['name']});

      output.features.forEach(function(feature){
        expect(feature.properties.name).to.be.ok();
        expect(feature.properties.category).to.not.be.ok();
        expect(feature.properties.street).to.not.be.ok();
      });
    });


    it('does not include attributes listed in the exclude parameter', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], exclude: ['name']});

      output.features.forEach(function(feature){
        expect(feature.properties.name).to.not.be.ok();
        expect(feature.properties.category).to.be.ok();
        expect(feature.properties.street).to.be.ok();
      });
    });

    it('handles Point geom with x,y stored in one or two attributes', function(){
      var twoAttrs = [{ name: 'test location', y: -74, x: 39.0, foo: 'bar' }];

      var geoTwoAttrs = GeoJSON.parse(twoAttrs, {Point: ['x', 'y']});

      expect(geoTwoAttrs.features[0].geometry.coordinates[0]).to.be(-74);
      expect(geoTwoAttrs.features[0].geometry.coordinates[1]).to.be(39.0);

      var oneAttr = [{ name: 'test location', coords: [-74, 39], foo: 'bar'}];

      var geoOneAttr = GeoJSON.parse(oneAttr, {Point: 'coords'});

      expect(geoOneAttr.features[0].geometry.coordinates[0]).to.be(-74);
      expect(geoOneAttr.features[0].geometry.coordinates[1]).to.be(39.0);
    });

    it('parses data with different geometry types', function(){
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
        },
        {
          multipoint: [
            [100.0, 0.0], [101.0, 1.0]
          ],
          prop0: 'value0'
        },
        {
          multipolygon: [
            [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
             [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
          ],
          prop1: {'this': 'that'}
        },
        {
          multilinestring: [
            [ [100.0, 0.0], [101.0, 1.0] ],
            [ [102.0, 2.0], [103.0, 3.0] ]
          ],
          prop0: 'value1'
        }
      ];

      var output = GeoJSON.parse(data2, {
        'Point': ['x', 'y'],
        'LineString': 'line',
        'Polygon': 'polygon',
        'MultiPoint': 'multipoint',
        'MultiPolygon': 'multipolygon',
        'MultiLineString': 'multilinestring'
      });

      expect(output.features.length).to.be(6);

      output.features.forEach(function(feature){
        if(feature.geometry.type === 'Point') {
          expect(feature.geometry.coordinates[1]).to.be(0.5);
          expect(feature.geometry.coordinates[0]).to.be(102);
          expect(feature.properties.prop0).to.be("value0");
        } else if (feature.geometry.type === 'LineString') {
          expect(feature.geometry.coordinates.length).to.be(4);
          expect(feature.geometry.coordinates[0][1]).to.be(0);
          expect(feature.geometry.coordinates[0][0]).to.be(102);
          expect(feature.geometry.coordinates[3][1]).to.be(1);
          expect(feature.geometry.coordinates[3][0]).to.be(105);
          expect(feature.properties.prop0).to.be("value0");
          expect(feature.properties.prop1).to.be(0);
        } else if (feature.geometry.type === 'Polygon') {
          expect(feature.geometry.coordinates[0].length).to.be(5);
          expect(feature.geometry.coordinates[0][0][1]).to.be(0);
          expect(feature.geometry.coordinates[0][0][0]).to.be(100);
          expect(feature.geometry.coordinates[0][4][1]).to.be(0);
          expect(feature.geometry.coordinates[0][4][0]).to.be(100);
          expect(feature.properties.prop0).to.be("value0");
          expect(feature.properties.prop1['this']).to.be('that');
        }
      });
    });

    it('uses the default settings when they have been specified', function(){
      GeoJSON.defaults = {
        Point: ['lat', 'lng'],
        include: ['name'],
        crs: 'urn:ogc:def:crs:EPSG::4326'
      };

      var output = GeoJSON.parse(data, {});

      expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');

      output.features.forEach(function(feature){
        expect(feature.properties.name).to.be.ok();
        expect(feature.properties.lat).to.not.be.ok();
        expect(feature.properties.lng).to.not.be.ok();
        expect(feature.geometry.coordinates[0]).to.be.ok();
        expect(feature.geometry.coordinates[1]).to.be.ok();
      });

      it('only applies default settings that haven\'t been set in params', function(){
        var output = GeoJSON.parse(data, {include: ['category', 'street']});

        expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');

        output.features.forEach(function(feature){
          expect(feature.properties.name).to.not.be.ok();
          expect(feature.properties.category).to.be.ok();
          expect(feature.properties.street).to.be.ok();
        });
      });

      it('keeps the default settings until they have been explicity reset', function(){
        var output = GeoJSON.parse(data, {});

        expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');

        output.features.forEach(function(feature){
          expect(feature.properties.name).to.be.ok();
          expect(feature.properties.lat).to.not.be.ok();
          expect(feature.properties.lng).to.not.be.ok();
          expect(feature.geometry.coordinates[0]).to.be.ok();
          expect(feature.geometry.coordinates[1]).to.be.ok();
        });
      });

      GeoJSON.defaults = {};
    });

    it("adds 'bbox' and/or 'crs' to the output if either is specified in the parameters", function(){
      var output = GeoJSON.parse(data, {
        Point: ['lat', 'lng'],
        bbox: [-75, 39, -76, 40],
        crs: 'urn:ogc:def:crs:EPSG::4326'});

      expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');
      expect(output.bbox[0]).to.be(-75);
      expect(output.bbox[1]).to.be(39);
      expect(output.bbox[2]).to.be(-76);
      expect(output.bbox[3]).to.be(40);
    });

    it("adds extra attributes if extra param is set", function() {
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], extra: { 'foo':'bar', 'bar':'foo'}});

      output.features.forEach(function(feature){
        expect(feature.properties.foo).to.be('bar');
        expect(feature.properties.bar).to.be('foo');
      });

      var output2 = GeoJSON.parse(data, {
        Point: ['lat', 'lng'],
        extra: {
          style: {
            "color": "#ff7800",
            "weight": 5,
            "opacity": 0.65
          }
        }
      });

      output2.features.forEach(function(feature) {
        expect(feature.properties.style.color).to.be('#ff7800');
        expect(feature.properties.style.weight).to.be(5);
        expect(feature.properties.style.opacity).to.be(0.65);
      });
    });

    it("adds a properties key at the top level if the extraGlobal parameter is set", function() {
      var output = GeoJSON.parse(data, {
        Point: ['lat', 'lng'],
        extra: { 'foo':'bar', 'bar':'foo'},
        extraGlobal: { 'name': 'A bunch of points', 'source': 'Government website'}
      });

      expect(output.properties).to.be.ok();
      expect(output.properties.name).to.be('A bunch of points');
      expect(output.properties.source).to.be('Government website');

    });

    it("returns valid GeoJSON output when input length is 0", function(done){
      GeoJSON.parse([], {Point: ['lat', 'lng']}, function(geojson){
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(0);
        done();
      });
    });

    it("returns valid GeoJSON output for 0,0", function(done){
      GeoJSON.parse([{ lat: 0, lng: 0 }], {Point: ['lat', 'lng']}, function(geojson){
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(1);
        expect(geojson.features[0].geometry.coordinates[0]).to.equal(0);
        expect(geojson.features[0].geometry.coordinates[1]).to.equal(0);
        done();
      });
    });

    it("throws an error if no geometry attributes have been specified", function() {
      expect(function(){ GeoJSON.parse(data); }).to.throwException(/No geometry attributes specified/);
    });

    it("calls the calback function if one is provided", function(done){
      GeoJSON.parse(data, {Point: ['lat', 'lng']}, function(geojson){
        expect(geojson.features.length).to.be(3);

        geojson.features.forEach(function(feature){
          expect(feature.properties.lat).to.not.be.ok();
          expect(feature.properties.lng).to.not.be.ok();
          expect(feature.geometry.coordinates[0]).to.be.ok();
          expect(feature.geometry.coordinates[1]).to.be.ok();
        });

        done();
      });
    });

    it("returns the GeoJSON output if the callback parameter is not a function", function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng']}, 'foo');

      output.features.forEach(function(feature){
        expect(feature.properties.lat).to.not.be.ok();
        expect(feature.properties.lng).to.not.be.ok();
        expect(feature.geometry.coordinates[0]).to.be.ok();
        expect(feature.geometry.coordinates[1]).to.be.ok();
      });
    });

  });
});