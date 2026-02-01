# Zotero DOI Manager

An add-on for [Zotero](https://www.zotero.org/) that fetches DOI names for journal articles using the CrossRef API and shortDOIs using [shortdoi.org](http://shortdoi.org). It also verifies stored DOIs and marks invalid ones.

## Current status

- **Version:** 1.6.6  
- **Supported:**  8.x  
  

## Features

- **Get shortDOIs**: Look up shortDOIs for selected items (replacing stored DOIs, if any) and mark invalid DOIs
- **Get long DOIs**: Look up full DOIs for selected items and mark invalid DOIs
- **Verify and clean DOIs**: Look up full DOIs, verify stored DOIs are valid, and mark invalid ones. Also removes unnecessary prefixes (e.g. `doi:`, `https://doi.org/`, or publisher URL prefixes) from the DOI field

## Installation

1. Download the `.xpi` file from the [latest release](https://github.com/orbital188/zotero-shortdoi/releases/latest)
   - If using Firefox, right-click the file link and choose **Save Link As…**
2. In Zotero, open **Tools → Add-Ons…**
3. Drag the downloaded `.xpi` file into the Add-Ons window, or click the Gear ⚙ button → **Install Add-On from File…** and select the file

## Credits & License

**Open source.** This software is released under the [Mozilla Public License (MPL) 2.0](https://mozilla.org/MPL/2.0/). You may use, modify, and distribute it freely in compliance with the license.

- Original work by [Brenton M. Wiernik](https://github.com/bwiernik) — [zotero-shortdoi](https://github.com/bwiernik/zotero-shortdoi)
- Code adapted in part from [Zotero Google Scholar Citations](https://github.com/beloglazov/zotero-scholar-citations) by Anton Beloglazov
- Zotero 8 compatibility and updates by orbital188


- **Error handling**: Debug logging and improved error handling in bootstrap

---

Bugs, questions, and feature requests: [Issues](https://github.com/orbital188/zotero-shortdoi/issues)
