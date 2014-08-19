.PHONY: all test clean distclean


version := $(shell node -e "console.log(require('./package.json').version)")
npmbin := $(shell npm bin)


all:
	@echo "building: $(version)";                            \
	npm install;                                             \
	rm -f js/*.js;                                           \
	$(npmbin)/browserify lib/dist.js                         \
	  | tee ./js/genetic-$(version).js                       \
	  | $(npmbin)/uglifyjs > ./js/genetic-$(version).min.js; \
	echo "built:";                                           \
	ls -1 js/* | sed 's/^/  /'

test:
	@echo "running tests"

clean:
	rm -f js/*.js
	
distclean:
	rm -f js/*.js
	rm -rf node_modules