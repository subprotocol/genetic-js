all:
	npm ci;

check:
	@$(npmbin)/mocha --reporter spec
