# Kuest Owner Docs

Mintlify documentation for operators who own a Kuest site. This repository contains the launch, manual installation, and admin guides used to configure and operate the platform.

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint) to preview the docs locally:

```bash
npm i -g mint
```

Run the following command at the repository root:

```bash
mint dev
```

If the local preview fails, run `mint update` and confirm that you are executing the command from the root that contains `docs.json`.

Production URLs follow the paths in this repository. Example:

- `https://docs.kuest.com/launch/overview`
- `https://docs.kuest.com/manual-installation/vercel`
- `https://docs.kuest.com/admin/general`
