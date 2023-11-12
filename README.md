# run-in-background Action

[![Build Status](https://github.com/miguelteixeiraa/action-run-in-background/workflows/lint-and-test/badge.svg)](https://github.com/miguelteixeiraa/action-run-in-background/actions)

## Usage

```yaml
name: Hello Workflow
on:
  push:
    branches: '*'

jobs:
  helloJob:
    runs-on: ubuntu-latest
    steps:
      - name: 'Spin up server'
        uses: miguelteixeiraa/action-run-in-background@main
        with:
          script: |
            # run some blocking stuff
            pnpm start

          readiness-script: |
            # check if whatever is it to run, is ready
            if curl -sSf http://localhost:8000/hello > /dev/null; then
                echo "curl request was successful."
            else
                echo "curl request failed."
                exit 1
            fi

          shell: bash
          timeout: 30
```

## How it works

Uses NodeJs to spawn an independent process and runs the **health check** at every 5 seconds.

## License

[Apache 2.0](LICENSE)
