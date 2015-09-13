jsl:
	find ! -name '*.min.js' -name '*.js' -exec jsl -nologo -process {} \;

.PHONY: jsl
