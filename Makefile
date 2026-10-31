.PHONY: install dev dev-lan build preview preview-lan test check browser screenshots share-card
install:
	npm ci
dev:
	npm run dev
dev-lan:
	npm run dev:lan
build:
	npm run build
preview:
	npm run preview -- --port 5173 --strictPort
preview-lan:
	npm run preview:lan -- --port 5173 --strictPort
test:
	npm test
browser:
	npm run test:browser
check:
	npm test
	go test -race ./engine
	npm run format:check
	npm run build
	npm run test:browser
screenshots:
	node scripts/screenshots.mjs
share-card:
	npm run share-card
