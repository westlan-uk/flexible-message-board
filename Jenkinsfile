node {
	stage "Get deps"
	checkout scm
	make deps

	stage "Test"
	make tests
}
