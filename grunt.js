module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '// <%= pkg.name %>.js - v<%= pkg.version %>\n' +
        '// (c) 2012 Casey Thomas, MIT License'
    },
    simplemocha: {
      src: 'test/*.js'
    },
    mocha: {
      test: {
        src: ['test/test.html'],
        run: true
      }
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

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('all', 'simplemocha mocha lint min');
  grunt.registerTask('default', 'simplemocha lint min');
};