# run-in-background Action

Action to run stuff in background

![alt text](https://github.com/miguelteixeiraa/action-run-in-background/actions/workflows/lint-and-test.yaml/badge.svg)

### Inputs

```yaml
- uses: miguelteixeiraa/action-run-in-background@v1
  with:
    # Description: The script to run in background
    #
    # required: true
    script: ''

    # Description: The script that tells whether of not the process is ready/health.
    #
    # required: true
    readiness-script: ''

    # Description: The type of the shell that should be called.
    #
    # required: false
    # Default: bash
    shell: bash

    # Description: Max time in seconds to wait for readiness.
    #
    # required: false
    # Default: 120
    timeout: 120
```

### Usage

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
        uses: miguelteixeiraa/action-run-in-background@v1
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

### How it works

Uses NodeJs to spawn an independent process and runs the **health check** at every 5 seconds.

### License

[Apache 2.0](LICENSE)
