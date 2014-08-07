/**
 * Created by David Zhang on 2014/8/6.
 */

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            concat: {
                src: ['src/BaseChart.js', 'src/BarChart.js'],
                dest: 'release/<%= pkg.name %>.js'
            }
        },
        uglify: {
            build: {
                src: 'release/<%= pkg.name %>.js',
                dest: 'release/<%= pkg.name %>.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
}
