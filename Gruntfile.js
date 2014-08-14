/**
 * Created by David Zhang on 2014/8/6.
 */

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            concat: {
                src: ['src/Utils.js', 'src/BaseChart.js', 'src/AxesChart.js', 'src/BarChart.js'],
                dest: 'release/<%= pkg.name %>.js'
            }
        },
        uglify: {
            build: {
                src: 'release/<%= pkg.name %>.js',
                dest: 'release/<%= pkg.name %>.min.js'
            }
        },

        qunit: {
            all: ['test/*.html']
        },

        jshint: {
            all: ['src/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('test', ['concat', 'qunit']);
    grunt.registerTask('hint', ['jshint']);
}
