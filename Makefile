default: deps tests

deps:
	npm install express
	npm install socket.io
	npm install fs
	npm install body-parser
	npm install cookie-parser
	npm install express-session
	npm install serve-index
	npm install nodeunit

tests:
	nodeunit server/tests

jsl:
	find ! -name '*.min.js' -name '*.js' -exec jsl -nologo -process {} \;

.PHONY: default deps tests jsl
