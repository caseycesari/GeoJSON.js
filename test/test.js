if (typeof window === 'undefined') {
  var expect = require('expect.js');
  var GeoJSON = require('../geojson');
  var util = require('util');
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

      expect(count).to.be(2);
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

    it('parses object to single feature', function() {
        var output = GeoJSON.parse(data[0], {Point: ['lat', 'lng']});

        expect(output.type).to.be('Feature');
        expect(output.geometry.type).to.be('Point');
        expect(output.geometry.coordinates[1]).to.be(39.984);
        expect(output.geometry.coordinates[0]).to.be(-75.343);
        expect(output.properties.name).to.be('Location A');
        expect(output.properties.category).to.be('Store');
        expect(output.properties.street).to.be('Market');
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
        crs: { 'type': 'name', 'properties': { 'name': 'urn:ogc:def:crs:OGC:1.3:CRS84' }}
      };

      var output = GeoJSON.parse(data, {});

      expect(output.crs.properties.name).to.be('urn:ogc:def:crs:OGC:1.3:CRS84');

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
        crs: { 'type': 'name', 'properties': { 'name': 'urn:ogc:def:crs:EPSG::4326' }}});

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

    it("checks for invalid CRS's", function() {
      var options = {
        Point: ['lat', 'lng'],
        crs: { 'type': 'foo' }
      };

      expect(function(){ GeoJSON.parse(data, options); }).to.throwException('Invald CRS. Type attribute must be "name" or "link"');

      options = {
        Point: ['lat', 'lng'],
        crs: { 'type': 'name', 'properties': 'foo' }
      };

      expect(function(){ GeoJSON.parse(data, options); }).to.throwException('Invalid CRS. Properties must contain "name" key');

      options = {
        Point: ['lat', 'lng'],
        crs: { 'type': 'name', 'properties': { 'name': 'foo' }}
      };

      expect(function(){ GeoJSON.parse(data, options); }).to.not.throwException();

      options = {
        Point: ['lat', 'lng'],
        crs: { 'type': 'link', 'properties': { 'name': 'foo' }}
      };

      expect(function(){ GeoJSON.parse(data, options); }).to.throwException('Invalid CRS. Properties must contain "href" and "type" key');

      options = {
        Point: ['lat', 'lng'],
        crs: { 'type': 'link', 'properties': { 'type': 'foo' }}
      };

      expect(function(){ GeoJSON.parse(data, options); }).to.throwException('Invalid CRS. Properties must contain "href" and "type" key');

      options = {
        Point: ['lat', 'lng'],
        crs: { 'type': 'link', 'properties': { 'type': 'foo', 'href': 'bar' }}
      };

      expect(function(){ GeoJSON.parse(data, options); }).to.not.throwException();
    });

    it("accepts already formatted GeoJSON", function() {

        var data = [{name: 'Location A', geo: {"type": "Point", "coordinates": [125.6, 10.1]}}];
        var output = GeoJSON.parse(data, {GeoJSON: 'geo'});

        expect(output.type).to.be('FeatureCollection');
        expect(output.features).to.be.an('array');
        expect(output.features.length).to.be(1);
        expect(output.features[0].geometry.coordinates[0]).to.equal(125.6);
        expect(output.features[0].geometry.coordinates[1]).to.equal(10.1);
        expect(output.features[0].geometry.type).to.equal('Point');
        expect(output.features[0].properties.name).to.equal('Location A');
    });

    it("converts string coordinates into numbers", function() {
      var data = [{ lat: '39.343', lng: '-74.454'}];
      var output = GeoJSON.parse(data, {Point: ['lat', 'lng']});

      output.features.forEach(function(feature) {
        expect(feature.geometry.coordinates[0]).to.be.a('number');
        expect(feature.geometry.coordinates[1]).to.be.a('number');
      });
    });

    it("throws via doThrows on InvalidGeometryError", function() {
      var data = [{ lat: '39.343', lng: '-74.454'}];
      expect(function(){
        GeoJSON.parse(data, {doThrows: {invalidGeometry: true}, Point: 'lat'});
      }).to.throwException(GeoJSON.InvalidGeometryError);

    });

    it("nested polygon", function() {
      var data = {
        northeast: { lat: 29.8399961, lng: -82.38140709999999 },
        southwest: { lat: 29.7183041, lng: -82.555449 }
      };
      var output = GeoJSON.parse(data, {
        doThrows: {invalidGeometry: true},
        Polygon: {
          northeast: ['lat', 'lng'],
          southwest: ['lat', 'lng']
        }
      });

      expect(output.geometry.type).to.be.equal('Polygon');
      expect(output.geometry.coordinates.length).to.be.equal(2);
      output.geometry.coordinates.forEach(function(coords){
        expect(coords.length).to.be.equal(2);
      });
      expect(output.geometry.type).to.be.equal('Polygon');
      expect(output.geometry.coordinates[0]).to.be.eql([-82.38140709999999, 29.8399961]);
      expect(output.geometry.coordinates[1]).to.be.eql([-82.555449, 29.7183041]);
    });

    it("nested polygon, nested", function() {
      var data = {
        northeast: { crap:{lat: 29.8399961, lng: -82.38140709999999} },
        southwest: { crap1:{lat: 29.7183041}, crap2: {lng: -82.555449} }
      };
      var output = GeoJSON.parse(data, {
        doThrows: {invalidGeometry: true},
        Polygon: {
          northeast: ['crap.lat', 'crap.lng'],
          southwest: ['crap1.lat', 'crap2.lng']
        },
        isPostgres: true,
        crs: { 'type': 'name', 'properties': { 'name': 'urn:ogc:def:crs:OGC:1.3:CRS84' }}
      });

      expect(output.geometry.crs).to.be.ok();
      expect(output.geometry.type).to.be.equal('Polygon');
      expect(output.geometry.coordinates.length).to.be.equal(2);
      output.geometry.coordinates.forEach(function(coords){
        expect(coords.length).to.be.equal(2);
      });
      expect(output.geometry.type).to.be.equal('Polygon');
      expect(output.geometry.coordinates[0]).to.be.eql([-82.38140709999999, 29.8399961]);
      expect(output.geometry.coordinates[1]).to.be.eql([-82.555449, 29.7183041]);
    });

    it('can accept up to three arguments for Point', function(done) {
      var data = [
        { name: 'Location A', category: 'Store', lat: 39.984, lng: -75.343, alt: 22026.46, street: 'Market' },
      ];

      GeoJSON.parse(data, { Point: ['lat', 'lng', 'alt'] }, function(geojson) {
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(1);
        expect(geojson.features[0].geometry.coordinates[0]).to.equal(-75.343);
        expect(geojson.features[0].geometry.coordinates[1]).to.equal(39.984);
        expect(geojson.features[0].geometry.coordinates[2]).to.equal(22026.46);
        done();
      });
    });

    it('can accept nested arguments for Point', function(done) {
      var data = [
        { name: 'Location A', category: 'Store', location: { point: { lat: 39.984, lng: -75.343 } } }
      ];

      GeoJSON.parse(data, { Point: ['location.point.lat', 'location.point.lng'] }, function(geojson) {
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(1);
        expect(geojson.features[0].geometry.coordinates[0]).to.equal(-75.343);
        expect(geojson.features[0].geometry.coordinates[1]).to.equal(39.984);
        done();
      });
    });

    it('can accept nested arguments for multiple geometries', function(done) {
      var data = [
        { geo: { point: { lng: 0.5, lat: 102.0 } } },
        { geo: { line: [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0] ] } },
        { geo: { polygon: [ [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ] ] } },
        { geo: { multipoint: [ [100.0, 0.0], [101.0, 1.0] ] } },
        { geo: { multipolygon: [ 
            [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]],
            [[[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
        ] } },
        { geo: { multilinestring: [ [ [100.0, 0.0], [101.0, 1.0] ], [ [102.0, 2.0], [103.0, 3.0] ] ] } }
      ];

      GeoJSON.parse(data, {
        Point: ['geo.point.lng', 'geo.point.lat'],
        'LineString': 'geo.line',
        'Polygon': 'geo.polygon',
        'MultiPoint': 'geo.multipoint',
        'MultiPolygon': 'geo.multipolygon',
        'MultiLineString': 'geo.multilinestring'
      }, function(geojson) {
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(6);
        expect(geojson.features[0].geometry.type).to.be('Point');
        expect(geojson.features[0].geometry.coordinates[0]).to.be(102);
        expect(geojson.features[0].geometry.coordinates[1]).to.be(0.5);
        expect(geojson.features[1].geometry.type).to.be('LineString');
        expect(geojson.features[1].geometry.coordinates[0][0]).to.be(102);
        expect(geojson.features[1].geometry.coordinates[0][1]).to.be(0);
        expect(geojson.features[1].geometry.coordinates[3][0]).to.be(105);
        expect(geojson.features[1].geometry.coordinates[3][1]).to.be(1);
        expect(geojson.features[2].geometry.type).to.be('Polygon');
        expect(geojson.features[2].geometry.coordinates[0][0][0]).to.be(100);
        expect(geojson.features[2].geometry.coordinates[0][0][1]).to.be(0);
        expect(geojson.features[2].geometry.coordinates[0][4][0]).to.be(100);
        expect(geojson.features[2].geometry.coordinates[0][4][1]).to.be(0);
        expect(geojson.features[3].geometry.type).to.be('MultiPoint');
        expect(geojson.features[3].geometry.coordinates[0][0]).to.be(100);
        expect(geojson.features[3].geometry.coordinates[0][1]).to.be(0);
        expect(geojson.features[3].geometry.coordinates[1][0]).to.be(101);
        expect(geojson.features[3].geometry.coordinates[1][1]).to.be(1);
        expect(geojson.features[4].geometry.type).to.be('MultiPolygon');
        expect(geojson.features[4].geometry.coordinates[0][0][0][0]).to.be(102);
        expect(geojson.features[4].geometry.coordinates[0][0][0][1]).to.be(2);
        expect(geojson.features[4].geometry.coordinates[0][0][4][0]).to.be(102);
        expect(geojson.features[4].geometry.coordinates[0][0][4][1]).to.be(2);
        expect(geojson.features[4].geometry.coordinates[2][0][0][0]).to.be(100.2);
        expect(geojson.features[4].geometry.coordinates[2][0][0][1]).to.be(0.2);
        expect(geojson.features[4].geometry.coordinates[2][0][4][0]).to.be(100.2);
        expect(geojson.features[4].geometry.coordinates[2][0][4][1]).to.be(0.2);
        expect(geojson.features[5].geometry.type).to.be('MultiLineString');
        expect(geojson.features[5].geometry.coordinates[0][0][0]).to.be(100);
        expect(geojson.features[5].geometry.coordinates[0][0][1]).to.be(0);
        expect(geojson.features[5].geometry.coordinates[0][1][0]).to.be(101);
        expect(geojson.features[5].geometry.coordinates[0][1][1]).to.be(1);
        expect(geojson.features[5].geometry.coordinates[1][0][0]).to.be(102);
        expect(geojson.features[5].geometry.coordinates[1][0][1]).to.be(2);
        expect(geojson.features[5].geometry.coordinates[1][1][0]).to.be(103);
        expect(geojson.features[5].geometry.coordinates[1][1][1]).to.be(3);
        done();
      });
    });

    it('can handle null or undefined values when parsing nested arguments', function(done) {
      var data = [
        { geo: null },
        { geo: { line: [[102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0] ] } },
        { geo: { polygon: [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ] } },
        { geo: { multipoint: [ [100.0, 0.0], [101.0, 1.0] ] } },
        { geo: { multipolygon: [ 
            [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
             [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
        ]}},
        { geo: { multilinestring: [ [ [100.0, 0.0], [101.0, 1.0] ], [ [102.0, 2.0], [103.0, 3.0] ] ] } }
      ];

      GeoJSON.parse(data, {
        Point: ['geo.nope.point.lng', 'geo.nope.point.lat'],
        LineString: 'geo.nope.line',
        Polygon: 'geo.nope.polygon',
        MultiPoint: 'geo.nope.multipoint',
        MultiPolygon: 'geo.nope.multipolygon',
        MultiLineString: 'geo.nope.multilinestring'
      }, function(geojson) {
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(6);
        expect(geojson.features[0].geometry).to.be(false);
        expect(geojson.features[1].geometry).to.be(false);
        expect(geojson.features[2].geometry).to.be(false);
        expect(geojson.features[3].geometry).to.be(false);
        expect(geojson.features[4].geometry).to.be(false);
        expect(geojson.features[5].geometry).to.be(false);
        done();
      });

    });

    it('can accept up to three arguments for Point in a nested structure', function(done) {
      var data = [
        { name: 'Location A', category: 'Store', location: { lat: 39.984, lng: -75.343, alt: 22026.46 }, street: 'Market' },
      ];

      GeoJSON.parse(data, { Point: ['location.lat', 'location.lng', 'location.alt'] }, function(geojson) {
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(1);
        expect(geojson.features[0].geometry.coordinates[0]).to.equal(-75.343);
        expect(geojson.features[0].geometry.coordinates[1]).to.equal(39.984);
        expect(geojson.features[0].geometry.coordinates[2]).to.equal(22026.46);
        done();
      });
    });
  });

  describe('Validates Geometry', function(){
    var data, options;
    before(function() {
      // Sample Data
      data = [
        { name: 'Location A', category: 'Store', lat: 39.984, lng: -75.343, street: 'Market' },
        { name: 'Location B', category: 'House', lat: 39.284, lng: -75.833, street: 'Broad' },
        { name: 'Location C', category: 'Office', lat: 39.123, lng: -74.534, street: 'South' },
        { name: 'Location D', category: 'Station', coordinates: [39.984, -75.353], street: 'Lower' },
        { name: 'Location E', category: 'Park', lat: 39.984, lng: -75.353, street: 'Main' }
      ];
    });

    it('will only return geometries that are valid.', function(done) {
      var options = {
        Point: ['lat', 'lng'],
        removeInvalidGeometries: true
      };
      GeoJSON.parse(data, options, function(geojson) {
        expect(geojson.type).to.be('FeatureCollection');
        expect(geojson.features).to.be.an('array');
        expect(geojson.features.length).to.be(4);
        done();
      });
    });

    it('will only return geometries that pass a custom validation check.', function(done){
      var options = { Point: ['lat', 'lng'], removeInvalidGeometries: true };
      options.isGeometryValid = function(geometry){
        return GeoJSON.isGeometryValid(geometry) &&
          geometry.coordinates[0] > -75.8 &&
          geometry.coordinates[1] < 39.9;
      };
      GeoJSON.parse(data, options, function(geojson) {
        expect(geojson.features.length).to.be(1);
        done();
      });
    });

    it('will only return geometries that pass a custom validation check provided as a default.', function(done){
      GeoJSON.defaults = { Point: ['lat', 'lng'], removeInvalidGeometries: true };
      GeoJSON.defaults.isGeometryValid = function(geometry){
        return GeoJSON.isGeometryValid(geometry) &&
          geometry.coordinates[0] > -75.8 &&
          geometry.coordinates[1] < 39.9;
      };
      GeoJSON.parse(data, {}, function(geojson) {
        expect(geojson.features.length).to.be(1);
        delete GeoJSON.defaults;
        done();
      });
    });

    it('will throw an error when a geometry does not pass a custom validation check.', function(){
      var options = { Point: ['lat', 'lng'], doThrows: { invalidGeometry: true } };
      options.isGeometryValid = function(geometry){
        return GeoJSON.isGeometryValid(geometry) &&
          geometry.coordinates[0] > -75.8 &&
          geometry.coordinates[1] < 39.9;
      };
      expect(function(){
        GeoJSON.parse(data, options);
      }).to.throwException(GeoJSON.InvalidGeometryError);
    });
  });

  describe('Parse points as coordinate pair', function(){
    var data;

    before(function() {
      // Sample Data - note the coordinates
      data = [
        { name: 'Location A', category: 'Store', street: 'Market', coordinates: [39.984, -75.343] },
        { name: 'Location B', category: 'House', street: 'Broad', coordinates: [39.284, -75.833] },
        { name: 'Location C', category: 'Office', street: 'South', coordinates: [39.123, -74.534] }
      ];
    });

    it('returns output with the same number of features as the input', function(){
      var output = GeoJSON.parse(data, {Point: [{coordinates: ['lat', 'lng']}]});

      expect(output.features.length).to.be(3);
    });

    it('returns valid coordinates for the coordinate pair', function(){
      var output = GeoJSON.parse(data, {Point: [{coordinates: ['lat', 'lng']}]});

      expect(output.features[0].geometry.coordinates[0]).to.be(data[0].coordinates[1]);
      expect(output.features[0].geometry.coordinates[1]).to.be(data[0].coordinates[0]);
      expect(output.features[1].geometry.coordinates[0]).to.be(data[1].coordinates[1]);
      expect(output.features[1].geometry.coordinates[1]).to.be(data[1].coordinates[0]);
      expect(output.features[2].geometry.coordinates[0]).to.be(data[2].coordinates[1]);
      expect(output.features[2].geometry.coordinates[1]).to.be(data[2].coordinates[0]);
    });
  });
});
