module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			distVendors: {
				src: [
					'bower_components/**/*.min.js',
				],
				dest: 'dist/vendor.js'
			},
			distSrc: {
				src: [
					'app.js',
					'*View/*Ctrl.js'
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},

			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.distSrc.dest %>'],
					'dist/vendor.min.js': ['<%= concat.distVendor.dest %>']
				}
			}
		},

		jshint: {
			files: ['Gruntfile.js', 'app.js', 'homeView/*.js', 'residentView/*.js']
		},

		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint']
		},

		cssmin: {
			target: {
				files: {
					'dist/styles.css': ['bower_components/angular-material/*.min.css', 'garageApp.css']
				}
			}
		},

		copy: {
			main: {
				files: [
					{expand: true, src: ['*View/*.html'], dest: 'dist/'},
					{expand: true, src: 'index.html', dest: 'dist/'},
					{expand: true, src: 'assets/**', dest: 'dist/'}
				]
			}
		},

		processhtml: {
			dist: {
				files: {
					'dist/index.html': ['index.html']
				}
			}
		},

		clean: ['dist/garage-directory.js']
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['jshint', 'cssmin', 'concat', 'uglify', 'copy', 'processhtml', 'clean']);
};