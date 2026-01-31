# Zotero DOI Manager

This is an add-on for Zotero, a research source management tool. The add-on can auto-fetch DOI names for journal articles using the CrossRef API, as well as look up shortDOI names using http://shortdoi.org. The add-on additionally verifies that stored DOIs are valid and marks invalid DOIs.

## Fork Information

This is a fork of [zotero-shortdoi](https://github.com/bwiernik/zotero-shortdoi) by [Brenton M. Wiernik](https://github.com/bwiernik).

### Changes in This Fork (v1.6.0)

- **Zotero 8 compatibility**: Updated to support Zotero 8 with ESM module imports
- **Improved Services loading**: Fixed Services object loading to work across Zotero 6, 7, and 8
- **Enhanced error handling**: Added comprehensive debug logging and error handling in bootstrap process
- **Version compatibility**: Now supports Zotero 6.0 through 8.*

## Compatibility

| Zotero Version | Supported |
|----------------|-----------|
| Zotero 6.x     | ✅        |
| Zotero 7.x     | ✅        |
| Zotero 8.x     | ✅        |

Please report any bugs, questions, or feature requests in the [Issues](https://github.com/orbital188/zotero-shortdoi/issues) section.

Code for this extension is based in part on [Zotero Google Scholar Citations](https://github.com/beloglazov/zotero-scholar-citations) by Anton Beloglazov.

### Plugin Functions

  - Get shortDOIs: For the selected items, look up shortDOIs (replacing stored DOIs, if any) and mark invalid DOIs.
  - Get long DOIs: For the selected items, look up full DOIs (replacing stored DOIs, if any) and mark invalid DOIs.
  - Verify and clean DOIs: For the selected items, look up full DOIs (replacing stored DOIs, if any), verify that stored DOIs are valid, and mark invalid DOIs.
    - This function also removes unnecessary prefixes (such as `doi:`, `https://doi.org/`, or a publisher URL prefix) from the DOI field.

### How to Install

  - Download the `.xpi` file for the [latest release](https://github.com/orbital188/zotero-shortdoi/releases/latest).
    - For the original version without Zotero 8 support, see [bwiernik's releases](https://github.com/bwiernik/zotero-shortdoi/releases/latest).
    - If you are using Firefox, be sure to right-click on the file link and choose Save Link As…
  - In Zotero, open the Tools → Add-Ons… menu
  - Drag the downloaded `.xpi` file to the Add-Ons popup window.
    - Alternatively, click on the Gear ⚙ button in Add-Ons popup window, choose Install Add-On from File…, and select the downloaded `.xpi` file.

### License

Original work Copyright (C) 2017 Brenton M. Wiernik
Fork modifications Copyright (C) 2025 orbital188

Distributed under the Mozilla Public License (MPL) Version 2.0.
