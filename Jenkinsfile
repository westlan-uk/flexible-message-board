node {
	stage "Get deps"
	checkout scm
	sh "make deps"

	stage "Test"
	sh "make tests"
}
