// See: http://stackoverflow.com/questions/13412211/using-travis-ci-for-client-side-javascript-libraries
module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		qunit: {
			files: ['qunit.html']
		}
	});

	// Load plugin
	grunt.loadNpmTasks('grunt-contrib-qunit');

	// Task to run tests
	grunt.registerTask('test', 'qunit');
};