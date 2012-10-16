var GeoJSON = require('../geojson');
var expect = require('expect.js');

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

    it('should return output with the same number of features as the input', function(){
      expect(output.features.length).to.be(3);
    });

    it('should not include geometry fields in feature properties', function(){
      output.features.forEach(function(feature){
        expect(feature.properties.lat).to.not.be.ok();
        expect(feature.properties.lng).to.not.be.ok();
      });
    });

    it('should include all properties besides geometry attributes when include or exclude isn\'t set', function() {
      output.features.forEach(function(feature){
        expect(feature.properties.name).to.be.ok();
        expect(feature.properties.category).to.be.ok();
        expect(feature.properties.street).to.be.ok();
      });
    });

    it('should only include attributes that are listed in the include parameter', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], include: ['name']});

      output.features.forEach(function(feature){
        expect(feature.properties.name).to.be.ok();
        expect(feature.properties.category).to.not.be.ok();
        expect(feature.properties.street).to.not.be.ok();
      });
    });


    it('should only include attributes that not are listed in the exclude parameter', function(){
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng'], exclude: ['name']});

      output.features.forEach(function(feature){
        expect(feature.properties.name).to.not.be.ok();
        expect(feature.properties.category).to.be.ok();
        expect(feature.properties.street).to.be.ok();
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

      expect(geoTwoAttrs.features[0].geometry.coordinates[0]).to.be(-74);
      expect(geoTwoAttrs.features[0].geometry.coordinates[1]).to.be(39.0);

      var oneAttr = [{
        name: 'test location',
        coords: [-74, 39],
        foo: 'bar'
      }];

      var geoOneAttr = GeoJSON.parse(oneAttr, {Point: 'coords'});
      
      expect(geoOneAttr.features[0].geometry.coordinates[0]).to.be(-74);
      expect(geoOneAttr.features[0].geometry.coordinates[1]).to.be(39.0);
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

      expect(output.features.length).to.be(3);

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

    it('should use the default settings when they have been specified', function(){
      GeoJSON.defaults = {
        Point: ['lat', 'lng'],
        include: ['name'],
        crs: 'urn:ogc:def:crs:EPSG::4326'
      };

      var output = GeoJSON.parse(data);

      expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');

      output.features.forEach(function(feature){
        expect(feature.properties.name).to.be.ok();
        expect(feature.properties.lat).to.not.be.ok();
        expect(feature.properties.lng).to.not.be.ok();
        expect(feature.geometry.coordinates[0]).to.be.ok();
        expect(feature.geometry.coordinates[1]).to.be.ok();
      });

      it('should only apply default settings that haven\'t been set in params', function(){
        var output = GeoJSON.parse(data, {include: ['category', 'street']});

        expect(output.crs.properties.name).to.be('urn:ogc:def:crs:EPSG::4326');
        
        output.features.forEach(function(feature){
          expect(feature.properties.name).to.not.be.ok();
          expect(feature.properties.category).to.be.ok();
          expect(feature.properties.street).to.be.ok();
        });
      });

      it('shouldn\'t be affected from prior calls to parse that set params', function(){
        var output = GeoJSON.parse(data);

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

    it("it should add 'bbox' and/or 'crs' to the output if either is specified in the parameters", function(){
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

    it("should add extra attributes if extra param is set", function() {
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

    it("should throw an error if the objects parameter is empty", function(){
      var data = [];
      
      expect(function(){ GeoJSON.parse(data); }).to.throwException(/No data found/);
    });

    it("should throw an error if no geometry attributes have been specified", function() {
          expect(function(){ GeoJSON.parse(data); }).to.throwException(/No geometry attributes specified/);
    });

  });
});