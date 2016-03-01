module.exports = function(grunt) {

	grunt.initConfig({
		sass: {
			dist: {
				files: {
					'war/css/stylesheet.css' : 'war/css/sass/style.scss'
				}
			}
		},
		concat: {
			js: {
				src: ['war/js/app.js', 'war/js/config.js'],
				dest: 'war/js/scripts.js'
			},
			css: {
				src: ['war/css/styles.css', 'war/css/noselect.css'],
				dest: 'war/css/build.css'
			}
		},
		watch: {
			js: {
				files: ['war/js/**/*.js'],
				tasks: ['concat:js']
			},
			sass: {
				files: ['war/css/sass/**/*.scss'],
				tasks: ['sass', 'cssmin']
			},
			css: {
				files: ['war/css/**/*.css'],
				tasks: ['concat:css', 'cssmin']
			},
		},
		cssmin: {
			minify: {
				src: 'war/css/build.css',
				dest: 'war/css/build.min.css'
			}	
		},
		uglify: {
			options: {
				manage: false
			},
			minify: {
				files: {
					'war/js/scripts.min.js' : ['war/js/scripts.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.registerTask('default', ['concat', 'cssmin', 'watch']);

};