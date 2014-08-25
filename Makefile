.PHONY: all check clean distclean distcheck


version := $(shell node -e "console.log(require('./package.json').version)")
npmbin := $(shell npm bin)


all: clean
	@echo "building: $(version)";                            \
	npm install;                                             \
	$(npmbin)/browserify lib/dist.js                         \
	  | tee ./js/genetic-$(version).js                       \
	  | $(npmbin)/uglifyjs > ./js/genetic-$(version).min.js; \
	echo "built:";                                           \
	ls -1 js/* | sed 's/^/  /'

check:
	@$(npmbin)/mocha --reporter spec

distcheck: distclean all check

clean:
	rm -f js/*.js
	
distclean: clean
	rm -rf node_modules