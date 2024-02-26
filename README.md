# setup-elvish

This action downloads an Elvish binary and adds it to `PATH`.

Example of using this in a job ([complete
example](https://github.com/elves/setup-elvish/blob/main/.github/workflows/test.yml)):

```yaml
steps:
  - uses: elves/setup-elvish@v1
    with:
      elvish-version: 0.20.1
  - name: Run something with Elvish
    shell: elvish {0}
    run: |
      echo This is Elvish $version
```

If you would like use Elvish as the default shell in `run` blocks, add the
following to the top-level of the workflow configuration
([complete
example](https://github.com/elves/setup-elvish/blob/main/.github/workflows/test_default.yml)):

```yaml
defaults:
  run:
    shell: elvish
```
