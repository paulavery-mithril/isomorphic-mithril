BIN = ./node_modules/.bin
SRC = $(wildcard src/*.js) $(wildcard src/*/*.js)
LIB = $(SRC:src/%.js=lib/%.js)

build: $(LIB)

# Run all js files through babel to compile into ES5 code
lib/%.js: src/%.js
	@mkdir -p $(@D)
	@$(BIN)/babel $< --out-file $@

# Cleanup
clean:
	@rm -rf lib

# Lint all the source code
lint:
	@$(BIN)/eslint src

# Bump the version in package.json and add a commit for it
release-major: build lint
	@npm version major

release-minor: build lint
	@npm version minor

release-patch: build lint
	@npm version patch

# Publish to git and npm
publish:
	@git push --tags origin HEAD:master
	@npm publish
