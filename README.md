# FunRetro.io export

[![License][license-badge]][license-url]

> CLI tool to easily export [FunRetro.io](https://funretro.io/) retrospective boards using Playwright

## Installing / Getting started

It's required to have [npm](https://www.npmjs.com/get-npm) installed locally to follow the instructions.

```shell
git clone https://github.com/chunm/funretro-export.git
cd funretro-export
npm install
npm start -- "http://funretro.io/board..." "format1" "../exported-file.txt"
npm start -- "http://funretro.io/board..." "format2"
```

## TODO

- Export card comments
- More export options (PDF)

## Licensing

MIT License

[license-badge]: https://img.shields.io/github/license/robertoachar/docker-express-mongodb.svg
[license-url]: https://opensource.org/licenses/MIT
