develop:
	npx webpack serve

install:
	npm ci

build:
	rm -rf dist
	npm run build

test:
	npm test

lint:
	npx eslint .

.PHONY: test
