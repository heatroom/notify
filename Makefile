
build: components index.js notify.css template.js list.js
	@component build --dev

template.js: template.html
	@component convert $<

list.js: list.html
	@component convert $<

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
