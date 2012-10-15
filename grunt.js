module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '// <%= pkg.name %>.js - v<%= pkg.version %>\n' +
        '// (c) 2012 Casey Thomas, MIT License'
    },
    lint: {
      files: ['geojson.js', 'test/test.js']
    },
    min: {
      dist: {
        src: ['<banner>', 'geojson.js'],
        dest: 'geojson.min.js'
      }
    }
  });

  grunt.registerTask('default', 'lint min');
};